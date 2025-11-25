const { pool } = require("../config/db");
const ChiTieuModel = require('../models/ChiTieuModel');
const TuyenSinhModel = require('../models/TuyenSinhModel.js');

class TuyenSinhController {

    //NHẬP CHỈ TIÊU TUYỂN SINH
    static async nhapChiTieu(req, res) {
        try {
            const { maTruong, namHoc, soLuong } = req.body;

            // --- VALIDATION ---
            if (!maTruong || !namHoc || soLuong == null)
                return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });

            const regexNam = /^\d{4}-\d{4}$/;
            if (!regexNam.test(namHoc))
                return res.status(400).json({ message: "Năm học không đúng định dạng (yyyy-yyyy)" });

            if (isNaN(soLuong) || soLuong <= 0)
                return res.status(400).json({ message: "Số lượng chỉ tiêu phải là số dương" });
            // -------------------------------

            // GỌI MODEL ĐỂ THỰC HIỆN UPSERT
            const result = await ChiTieuModel.upsertChiTieu({ maTruong, namHoc, soLuong });

            if (result.action === 'UPDATE') {
                return res.status(200).json({
                    message: "Cập nhật chỉ tiêu thành công",
                    maChiTieu: result.maChiTieu,
                });
            } else {
                return res.status(201).json({
                    message: "Thêm chỉ tiêu thành công",
                    maChiTieu: result.maChiTieu,
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server nội bộ", error: error.message });
        }
    }

    //NHẬP ĐIỂM THI TUYỂN SINH
    static async nhapDiemThi(req, res) {
        try {
            const { maThiSinh, maTruong, diemToan, diemVan, diemAnh, namHoc } = req.body;

            // --- VALIDATION ---
            const regexNam = /^\d{4}-\d{4}$/;
            if (!regexNam.test(namHoc))
                return res.status(400).json({ message: "Năm học không đúng định dạng (yyyy-yyyy)" });

            if (!maThiSinh || !maTruong || diemToan == null || diemVan == null || diemAnh == null || !namHoc)
                return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });

            const diem = [diemToan, diemVan, diemAnh];
            if (diem.some((d) => isNaN(d))) return res.status(400).json({ message: "Điểm phải là số" });
            if (diem.some((d) => d < 0 || d > 10))
                return res.status(400).json({ message: "Điểm phải trong khoảng 0 - 10" });
            // -------------------------------

            const tongDiem = parseFloat(diemToan) + parseFloat(diemVan) + parseFloat(diemAnh);

            // GỌI MODEL KIỂM TRA SỰ TỒN TẠI
            if (!(await TuyenSinhModel.checkThiSinhExist(maThiSinh)))
                return res.status(400).json({ message: "Thí sinh chưa đăng ký nguyện vọng" });

            // GỌI MODEL ĐỂ THỰC HIỆN UPSERT
            const result = await TuyenSinhModel.upsertDiemThi({
                maThiSinh, maTruong, diemToan, diemVan, diemAnh, namHoc, tongDiem
            });

            if (result.action === 'UPDATE') {
                return res.status(200).json({ message: "Cập nhật điểm thành công", tongDiem });
            } else {
                return res.status(201).json({ message: "Nhập điểm thành công", maKetQua: result.maKetQua, tongDiem });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server nội bộ", error: error.message });
        }
    }

    //XÉT TUYỂN THEO NGUYỆN VỌNG (Sở GD&ĐT)
    static async xetTuyen(req, res, phase = 0, pool, maTruongHienTai) {
        const maTruong = maTruongHienTai || req.body.maTruong;
        const namHoc = req.body.namHoc;
        const currentPhase = phase || 1;

        try {
            // 0️⃣ Kiểm tra đầu vào
            if (!maTruong || !namHoc) return { error: "Thiếu mã trường hoặc năm học." };
            const regexNam = /^\d{4}-\d{4}$/;
            if (!regexNam.test(namHoc)) return { error: "Năm học không đúng định dạng (yyyy-yyyy)." };

            // 1️⃣ Lấy chỉ tiêu tuyển sinh
            const chiTieu = await ChiTieuModel.getQuota(maTruong, namHoc);
            if (chiTieu === null) return { error: "Chưa có chỉ tiêu cho trường này." };

            // Reset trạng thái nếu là pha 1
            if (currentPhase === 1) {
                await pool.query("UPDATE ketquaxettuyen SET trangThai='Không trúng tuyển' WHERE maTruong=? AND namHoc=?", [maTruong, namHoc]);
            }

            // Lấy điểm, xử lý điểm liệt
            const [allScores] = await pool.query(`SELECT maThiSinh, diemTrungTuyen, diemMon1, diemMon2, diemMon3 FROM ketquaxettuyen WHERE maTruong=? AND namHoc=?`, [maTruong, namHoc]);
            if (allScores.length === 0) return { error: "Không có dữ liệu thí sinh." };

            let count = 0;
            const daTrungTuyenLocal = new Set();
            const diemLietSet = new Set();
            const diemLietIDs = [];

            // Xử lý điểm liệt
            for (const scoreRow of allScores) {
                const diem = [scoreRow.diemMon1, scoreRow.diemMon2, scoreRow.diemMon3];
                if (diem.some(d => d < 1)) {
                    diemLietIDs.push(scoreRow.maThiSinh);
                    diemLietSet.add(scoreRow.maThiSinh);
                }
            }

            // Cập nhật trạng thái điểm liệt
            if (diemLietIDs.length > 0) {
                await TuyenSinhModel.updateDiemLietStatus(diemLietIDs, maTruong);
            }

            // Lấy map trạng thái trúng tuyển toàn cục
            const [trungTuyenGlobal] = await pool.query("SELECT maThiSinh, trangThai FROM ketquaxettuyen WHERE namHoc=? AND trangThai LIKE 'Trúng tuyển NV%'", [namHoc]);
            const daTrungTuyenGlobalMap = {};
            trungTuyenGlobal.forEach(row => {
                const currentNV = parseInt(row.trangThai.replace('Trúng tuyển NV', ''));
                if (!daTrungTuyenGlobalMap[row.maThiSinh] || currentNV < daTrungTuyenGlobalMap[row.maThiSinh].nv) {
                    daTrungTuyenGlobalMap[row.maThiSinh] = { nv: currentNV, status: row.trangThai };
                }
            });

            // 2️⃣ XÉT TUYỂN GIAI ĐOẠN HIỆN TẠI
            const nv = currentPhase;
            const [nvList] = await pool.query(`SELECT maThiSinh FROM nguyenvong WHERE NV${nv} = ?`, [maTruong]);

            const currentNVList = nvList
                .map(nvRow => {
                    const score = allScores.find(s => s.maThiSinh === nvRow.maThiSinh);
                    return score ? { maThiSinh: nvRow.maThiSinh, diemTrungTuyen: score.diemTrungTuyen } : null;
                })
                .filter(row => {
                    if (row === null) return false;
                    if (daTrungTuyenLocal.has(row.maThiSinh)) return false;
                    if (diemLietSet.has(row.maThiSinh)) return false;
                    const globalStatus = daTrungTuyenGlobalMap[row.maThiSinh];
                    if (globalStatus && globalStatus.nv <= nv) { return false; }
                    return true;
                })
                .sort((a, b) => b.diemTrungTuyen - a.diemTrungTuyen);

            // Tiến hành xét tuyển
            for (const row of currentNVList) {
                if (count >= chiTieu) break;
                let label = `Trúng tuyển NV${nv}`;
                await pool.query("UPDATE ketquaxettuyen SET trangThai=? WHERE maThiSinh=? AND maTruong=?", [label, row.maThiSinh, maTruong]);
                daTrungTuyenLocal.add(row.maThiSinh);
                count++;
            }

            // 3️⃣ XÁC ĐỊNH ĐIỂM CHUẨN
            let diemChuan = 0;
            if (count > 0) {
                const [lastAdmitted] = await pool.query(`SELECT diemTrungTuyen FROM ketquaxettuyen WHERE maTruong=? AND namHoc=? AND trangThai LIKE 'Trúng tuyển NV%' ORDER BY diemTrungTuyen ASC LIMIT 1`, [maTruong, namHoc]);
                if (lastAdmitted.length > 0) diemChuan = lastAdmitted[0].diemTrungTuyen;
            }

            // 4️⃣ Lấy kết quả chi tiết
            const [ketQuaChiTiet] = await pool.query(
                `SELECT kq.maThiSinh, ts.hoTen, kq.diemMon1, kq.diemMon2, kq.diemMon3, kq.diemTrungTuyen AS tongDiem, kq.trangThai FROM ketquaxettuyen kq JOIN thisinh ts ON kq.maThiSinh = ts.maThiSinh WHERE kq.maTruong=? AND kq.namHoc=? ORDER BY kq.trangThai ASC, tongDiem DESC`,
                [maTruong, namHoc]
            );

            // FIX: Ánh xạ trạng thái điểm liệt
            const finalKetQua = ketQuaChiTiet.map(kq => {
                if (diemLietSet.has(kq.maThiSinh) && !kq.trangThai.includes('Trúng tuyển NV')) {
                    kq.trangThai = "Không trúng tuyển (Điểm liệt)";
                }
                return kq;
            });

            return { success: true, maTruong, soTrungTuyen: count, diemChuan, ketQuaChiTiet: finalKetQua };

        } catch (error) {
            console.error(error);
            return { error: error.message };
        }
    }

    // Hàm điều phối xét tuyển
    static async runGlobalAdmissions(req, res) {
        try {
            const { namHoc } = req.body;
            if (!namHoc) return res.status(400).json({ message: "Thiếu năm học." });
            const regexNam = /^\d{4}-\d{4}$/;
            if (!regexNam.test(namHoc)) return res.status(400).json({ error: "Năm học không đúng định dạng (yyyy-yyyy)." });

            // 1. Lấy danh sách TẤT CẢ các mã trường cần xét tuyển
            const allSchools = await TuyenSinhModel.getSchoolsWithQuota(namHoc);

            if (allSchools.length === 0) {
                return res.status(400).json({ message: "Không tìm thấy trường nào có chỉ tiêu cho năm học này." });
            }

            const resultsSummary = [];

            // --- GIAI ĐOẠN 1, 2, 3: XÉT TUYỂN TỐI ƯU ---
            for (let phase = 1; phase <= 3; phase++) {

                // Lấy trạng thái trúng tuyển toàn cục
                const [trungTuyenGlobal] = await pool.query(
                    "SELECT maThiSinh, trangThai FROM ketquaxettuyen WHERE namHoc=? AND trangThai LIKE 'Trúng tuyển NV%'",
                    [namHoc]
                );
                const daTrungTuyenGlobalMap = {};
                trungTuyenGlobal.forEach(row => {
                    const currentNV = parseInt(row.trangThai.replace('Trúng tuyển NV', ''));
                    if (!daTrungTuyenGlobalMap[row.maThiSinh] || currentNV < daTrungTuyenGlobalMap[row.maThiSinh].nv) {
                        daTrungTuyenGlobalMap[row.maThiSinh] = { nv: currentNV, status: row.trangThai };
                    }
                });

                // Chạy xét tuyển cho TẤT CẢ các trường trong giai đoạn hiện tại
                for (const maTruong of allSchools) {
                    // GỌI HÀM STATIC CỦA CLASS
                    const result = await TuyenSinhController.xetTuyen(
                        { body: req.body, pool },
                        res,
                        phase,
                        pool,
                        maTruong,
                        daTrungTuyenGlobalMap
                    );

                    if (result.success) {
                        resultsSummary.push({ maTruong, nv: phase, soTrungTuyen: result.soTrungTuyen, diemChuan: result.diemChuan });
                    }
                }
            }
            // ---------------------------------------------------------------------

            // 4. Thu thập kết quả chi tiết CUỐI CÙNG
            let allFinalResults = [];
            for (const maTruong of allSchools) {
                const [ketQuaChiTiet] = await pool.query(
                    `SELECT kq.maThiSinh, ts.hoTen, kq.diemMon1, kq.diemMon2, kq.diemMon3, kq.diemTrungTuyen AS tongDiem, kq.trangThai FROM ketquaxettuyen kq JOIN thisinh ts ON kq.maThiSinh = ts.maThiSinh WHERE kq.maTruong=? AND kq.namHoc=? ORDER BY kq.trangThai ASC, tongDiem DESC`,
                    [maTruong, namHoc]
                );

                // FIX: Ánh xạ kết quả điểm liệt
                const [allScoresForMapping] = await pool.query(`SELECT maThiSinh, diemMon1, diemMon2, diemMon3 FROM ketquaxettuyen WHERE maTruong=? AND namHoc=?`, [maTruong, namHoc]);
                const diemLietSetFinal = new Set();
                for (const scoreRow of allScoresForMapping) {
                    const diem = [scoreRow.diemMon1, scoreRow.diemMon2, scoreRow.diemMon3];
                    if (diem.some(d => d < 1)) {
                        diemLietSetFinal.add(scoreRow.maThiSinh);
                    }
                }

                const finalKetQua = ketQuaChiTiet.map(kq => {
                    if (diemLietSetFinal.has(kq.maThiSinh) && !kq.trangThai.includes('Trúng tuyển NV')) {
                        kq.trangThai = "Không trúng tuyển (Điểm liệt)";
                    }
                    return kq;
                });

                allFinalResults.push({ maTruong: maTruong, ketQua: finalKetQua || [] });
            }

            // 5. Trả về kết quả tổng hợp
            return res.status(200).json({
                message: "QUY TRÌNH XÉT TUYỂN TOÀN CỤC ĐÃ HOÀN TẤT. Kết quả dưới đây là trạng thái cuối cùng sau khi xét hết 3 nguyện vọng.",
                resultsSummary: resultsSummary,
                ketQuaTuyểnSinhChiTiết: allFinalResults
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server nội bộ trong quá trình điều phối", error: error.message });
        }
    }
}

module.exports = TuyenSinhController;