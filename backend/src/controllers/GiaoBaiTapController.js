const ClassModel = require("../models/LopModel"); 
const BaiTapModel = require("../models/BaiTapModel"); 
const {pool} = require("../config/db"); // Đã sửa import

// --- HÀM TẠO ID SỐ (BT001, CH123) ---
function generateNumericId(prefix) {
  const num = Math.floor(Math.random() * 1000); // Tạo số từ 0 -> 999
  const id = num.toString().padStart(3, '0'); // Đệm số 0: 1 -> '001'
  return `${prefix}${id}`;
}
// -------------------------------------

class GiaoBaiTapController {
    
    // (Hàm này OK)
    static async getLopDayList(req, res) {
        try {
            const { maGiaoVien } = req.user;
            if (!maGiaoVien) {
                return res.status(403).json({ message: "Tài khoản không phải là giáo viên." });
            }
            const lopDayList = await ClassModel.getLopDayByGiaoVien(maGiaoVien);
            res.status(200).json(lopDayList);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    // (Hàm này OK)
    static async createBaiTapTuLuan(req, res) {
        try {
            const { maGiaoVien, maMonHoc } = req.user;
            if (!maGiaoVien || !maMonHoc) {
                return res.status(403).json({ message: "Không thể xác định thông tin giáo viên hoặc môn học." });
            }
            const { maLop, tieuDe, moTa, hanNop } = req.body;
            if (!maLop || !tieuDe || !hanNop) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin (Lớp, Tiêu đề, Hạn nộp)." });
            }
            const fileHuongDan = req.file ? req.file.path : null;
            
            // SỬA ID: Dùng hàm tạo số
            const maBaiTap = generateNumericId('BT');
            
            const baiTapData = {
                maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop, fileHuongDan
            };
            await BaiTapModel.createBaiTapTuLuan(baiTapData);
            res.status(201).json({ message: "Thêm bài tập tự luận thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server khi tạo bài tự luận: " + error.message });
        }
    }


    // ------------------------------------
    // HÀM QUAN TRỌNG (Đã viết lại, đưa toàn bộ SQL vào đây)
    // ------------------------------------
    static async createBaiTapTracNghiem(req, res) {
        let connection;
        try {
            // 1. Lấy thông tin GV
            const { maGiaoVien, maMonHoc } = req.user;
            if (!maGiaoVien || !maMonHoc) {
                return res.status(403).json({ message: "Không thể xác định thông tin giáo viên hoặc môn học." });
            }
            
            // 2. Lấy dữ liệu
            const { maLop, tieuDe, moTa, hanNop, cauHoiList } = req.body;

            // 3. Validation
            if (!maLop || !tieuDe || !hanNop) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin (Lớp, Tiêu đề, Hạn nộp)." });
            }
            if (!cauHoiList || !Array.isArray(cauHoiList) || cauHoiList.length === 0) {
                return res.status(400).json({ message: "Bài trắc nghiệm phải có ít nhất 1 câu hỏi." });
            }
            for (const ch of cauHoiList) {
                if (!ch.dapanList || ch.dapanList.length < 2) {
                return res.status(400).json({ message: `Câu hỏi "${ch.noiDung.substring(0, 20)}..." phải có ít nhất 2 lựa chọn.`});
                }
                const coDapAnDung = ch.dapanList.some(dp => dp.isCorrect === true || dp.isCorrect === 1);
                if (!coDapAnDung) {
                return res.status(400).json({ message: `Câu hỏi "${ch.noiDung.substring(0, 20)}..." phải có ít nhất 1 đáp án đúng.`});
                }
            }

            // 4. Bắt đầu Transaction
            connection = await pool.getConnection(); 
            await connection.beginTransaction();

            // 5. TẠO BÀI TẬP (SQL trực tiếp)
            // SỬA ID: Dùng hàm tạo số
            const maBaiTap = generateNumericId('BT');
            const sqlBaiTap = `INSERT INTO baitap 
                                (maBaiTap, maLop, maMon, tieuDe, moTa, hanNop, loaiBai, ngayTao) 
                                VALUES (?, ?, ?, ?, ?, ?, 'Trắc nghiệm', NOW())`;
            await connection.execute(sqlBaiTap, [maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop]);

            // 6. Lặp qua từng câu hỏi
            for (const cauHoi of cauHoiList) {
                
                // 6a. TẠO CÂU HỎI (SQL trực tiếp)
                // SỬA ID: Dùng hàm tạo số
                const maCauHoi = generateNumericId('CH');
                const sqlCauHoi = `INSERT INTO cauhoi (maCauHoi, maBaiTap, noiDung) VALUES (?, ?, ?)`;
                await connection.execute(sqlCauHoi, [maCauHoi, maBaiTap, cauHoi.noiDung]);
                
                // 6b. Lặp qua từng đáp án
                for (const dp of cauHoi.dapanList) {
                    // SỬA ID: Dùng hàm tạo số
                    const maDapAn = generateNumericId('DA');
                    const isCorrectValue = (dp.isCorrect === true || dp.isCorrect === 1) ? 1 : 0;
                    
                    // 6c. TẠO ĐÁP ÁN (SQL trực tiếp)
                    const sqlDapAn = "INSERT INTO dapan (maDapAn, maCauHoi, noiDung, isCorrect) VALUES (?, ?, ?, ?)";
                    await connection.execute(sqlDapAn, [maDapAn, maCauHoi, dp.noiDung, isCorrectValue]);
                }
            }
            
            // 7. Hoàn tất Transaction
            await connection.commit();

            res.status(201).json({ message: "Thêm bài tập trắc nghiệm thành công!" });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            res.status(500).json({ message: "Lỗi server khi tạo bài trắc nghiệm: " + error.message });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = GiaoBaiTapController;