// Import các models
const MonHocModel = require("../models/MonHocModel");
const BaiTapModel = require("../models/BaiTapModel");
const CauHoiModel = require("../models/CauHoiModel");
const DapAnModel = require("../models/DapAnModel");
const BaiLamModel = require("../models/BaiLamModel");
const {pool} = require("../config/db"); 

class BaiTapController {
  /**
   * Flow 1: Lấy danh sách Môn học
   */
  static async getMonHocList(req, res) {
    try {
      // Dùng trực tiếp 'maLop' từ middleware
      const { maLop } = req.user; 

      if (!maLop) {
        return res.status(403).json({ message: "Tài khoản không phải là học sinh."});
      }

      const subjects = await MonHocModel.getMonHocByLop(maLop);
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }

  /**
   * Flow 2: Lấy danh sách Bài tập từ Môn học
   */
  static async getBaiTapListByMon(req, res) {
    try {
      const { maMonHoc } = req.params;
      // Dùng trực tiếp 'maHocSinh' và 'maLop' từ middleware
      const { maHocSinh, maLop } = req.user;

      if (!maHocSinh || !maLop) {
        return res.status(403).json({ message: "Tài khoản không phải là học sinh."});
      }

      const exercises = await BaiTapModel.getBaiTapByMonHoc(maLop, maMonHoc, maHocSinh);
      res.status(200).json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }

  /**
   * Flow 4 & 5: Lấy chi tiết bài tập (Kiểm tra hạn, Lấy câu hỏi)
   */
  static async getBaiTapDetail(req, res) {
    try {
      const { maBaiTap } = req.params;
      const baiTap = await BaiTapModel.getBaiTapById(maBaiTap);

      if (!baiTap) {
        return res.status(404).json({ message: "Không tìm thấy bài tập." });
      }

      // Alternative Flow 4.1: Kiểm tra hạn nộp
      const hanNop = new Date(baiTap.hanNop);
      if (new Date() > hanNop) {
        return res.status(403).json({ 
          message: "Đã hết hạn làm bài tập này.",
          baiTap: baiTap 
        });
      }

      // Basic Flow 5: Nếu là trắc nghiệm, lấy thêm câu hỏi
      if (baiTap.loaiBai === 'Trắc nghiệm') {
        const questions = await CauHoiModel.getCauHoiTracNghiem(maBaiTap);
        return res.status(200).json({ ...baiTap, cauHoi: questions });
      }

      // Alternative Flow 5.1: Nếu là tự luận, chỉ trả về chi tiết bài
      res.status(200).json(baiTap);

    } catch (error) {
      res.status(500).json({ message: "Lỗi server: " + error.message });
    }
  }


  /**
   * Flow 6-9 & Alt 5: Nộp bài (Cả trắc nghiệm và tự luận)
   */
  static async submitBaiLam(req, res) {
    const { maBaiTap } = req.params;
    const { maHocSinh } = req.user; 

    if (!maHocSinh) {
      return res.status(403).json({ message: "Tài khoản không phải là học sinh." });
    }

    let connection;

    try {
      // 1. Kiểm tra thông tin bài tập (hạn nộp, loại bài)
      const baiTap = await BaiTapModel.getBaiTapById(maBaiTap);
      if (!baiTap) {
        return res.status(404).json({ message: "Không tìm thấy bài tập." });
      }

      // 2. Kiểm tra hạn nộp LẦN NỮA
      // (Sửa lại: Dùng tên cột 'hanNop' từ JSON bạn gửi)
      const hanNop = new Date(baiTap.hanNop); 
      if (new Date() > hanNop) {
        return res.status(403).json({ message: "Đã hết hạn làm bài." });
      }

      // 3. Xử lý nộp bài
      
      // ------ 3.1: XỬ LÝ NỘP BÀI TỰ LUẬN ------
      // (Sửa lại: Dùng tên cột 'loaiBai' từ JSON bạn gửi)
      if (baiTap.loaiBai === 'Tự luận') { 
        if (!req.file) {
          return res.status(400).json({ message: "File không được trống." });
        }
        
        const fileNopPath = req.file.path;
        await BaiLamModel.nopBaiTuLuan(maHocSinh, maBaiTap, fileNopPath);
        
        return res.status(201).json({ message: "Nộp bài thành công! (Chờ chấm điểm)" });
      }

      // ------ 3.2: XỬ LÝ NỘP BÀI TRẮC NGHIỆM ------
      // (Sửa lại: Dùng tên cột 'loaiBai' từ JSON bạn gửi)
      if (baiTap.loaiBai === 'Trắc nghiệm') {
        
        // Body gửi lên bây giờ phải là: { answers: [{maCauHoi, maDapAn}, ...] }
        const { answers } = req.body; 
        
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
          return res.status(400).json({ message: "Bài nộp không hợp lệ." });
        }

        // --- Chấm điểm tự động (ĐÃ SỬA LOGIC) ---
        const dsDapAnDung = await DapAnModel.getDapAnDung(maBaiTap);
        
        // Tạo một Map: (maCauHoi => maDapAnDung)
        const dapAnMap = new Map(dsDapAnDung.map(d => [d.maCauHoi, d.maDapAn]));
        
        let soCauDung = 0;
        answers.forEach(answer => {
          // So sánh maDapAn của học sinh với maDapAnDung trong Map
          if (dapAnMap.get(answer.maCauHoi) === answer.maDapAn) {
            soCauDung++;
          }
        });
        
        const diemSo = (soCauDung / dapAnMap.size) * 10; 

        // --- Lưu bài làm (Sử dụng Transaction) ---
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        await BaiLamModel.nopBaiTracNghiem(
          connection,
          maHocSinh,
          maBaiTap,
          diemSo,
          answers // Truyền mảng [{maCauHoi, maDapAn}]
        );
        
        await connection.commit(); 
        
        return res.status(201).json({ 
          message: "Nộp bài thành công!",
          diemSo: diemSo.toFixed(2), 
          soCauDung: soCauDung,
          tongSoCau: dapAnMap.size
        });
      }
      
      return res.status(400).json({ message: "Loại bài tập không hỗ trợ." });

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      res.status(500).json({ message: "Lỗi server khi nộp bài: " + error.message });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

module.exports = BaiTapController;