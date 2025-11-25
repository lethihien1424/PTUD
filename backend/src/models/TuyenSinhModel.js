const { pool } = require("../config/db"); 

class TuyenSinhModel {
    
    static async checkThiSinhExist(maThiSinh) {
        try {
            const [thiSinh] = await pool.query("SELECT maThiSinh FROM thisinh WHERE maThiSinh = ?", [maThiSinh]);
            return thiSinh.length > 0;
        } catch (error) {
            throw new Error(`Lỗi DB khi kiểm tra thí sinh: ${error.message}`);
        }
    }

    static async upsertDiemThi(data) {
        try {
            const { maThiSinh, maTruong, diemToan, diemVan, diemAnh, namHoc, tongDiem } = data;

            // 1. TẠO ID KẾT QUẢ MỚI (Logic mã tự động KQ001,...)
            const [rows] = await pool.query("SELECT MAX(maKetQua) AS maxMa FROM ketquaxettuyen");
            let newId = "KQ001";
            if (rows[0].maxMa) {
                const num = parseInt(rows[0].maxMa.replace("KQ", "")) + 1;
                newId = "KQ" + num.toString().padStart(3, "0");
            }
            
            // 2. KIỂM TRA TỒN TẠI VÀ THỰC HIỆN UPSERT
            const [exist] = await pool.query(
                "SELECT maKetQua FROM ketquaxettuyen WHERE maThiSinh = ? AND maTruong = ?", 
                [maThiSinh, maTruong]
            );
            
            if (exist.length > 0) {
                await pool.query(
                    `UPDATE ketquaxettuyen SET diemMon1=?, diemMon2=?, diemMon3=?, diemTrungTuyen=?, namHoc=? WHERE maThiSinh=? AND maTruong=?`,
                    [diemToan, diemVan, diemAnh, tongDiem, namHoc, maThiSinh, maTruong]
                );
                return { action: 'UPDATE', maKetQua: exist[0].maKetQua, tongDiem };
            } else {
                await pool.query(
                    `INSERT INTO ketquaxettuyen (maKetQua, trangThai, namHoc, diemTrungTuyen, diemMon1, diemMon2, diemMon3, maThiSinh, maTruong) VALUES (?, 'Không trúng tuyển', ?, ?, ?, ?, ?, ?, ?)`,
                    [newId, namHoc, tongDiem, diemToan, diemVan, diemAnh, maThiSinh, maTruong]
                );
                return { action: 'INSERT', maKetQua: newId, tongDiem };
            }
        } catch (error) {
            throw new Error(`Lỗi DB khi UPSERT điểm thi: ${error.message}`);
        }
    }

    static async getSchoolsWithQuota(namHoc) {
        try {
            const [schools] = await pool.query(
                "SELECT DISTINCT maTruong FROM chitieutuyensinh WHERE namHoc=?",
                [namHoc]
            );
            return schools.map(row => row.maTruong);
        } catch (error) {
             throw new Error(`Lỗi DB khi lấy danh sách trường có chỉ tiêu: ${error.message}`);
        }
    }
    
    static async updateDiemLietStatus(diemLietIDs, maTruong) {
        if (!diemLietIDs || diemLietIDs.length === 0) return;
        try {
            const status = "Không trúng tuyển (Điểm liệt)";
            // Sử dụng IN (?) để cập nhật tất cả thí sinh điểm liệt chỉ trong 1 lần gọi DB
            await pool.query(
                `UPDATE ketquaxettuyen SET trangThai = ? WHERE maThiSinh IN (?) AND maTruong = ?`,
                [status, diemLietIDs, maTruong]
            );
        } catch (error) {
            throw new Error(`Lỗi DB khi cập nhật Điểm Liệt: ${error.message}`);
        }
    }
}

module.exports = TuyenSinhModel;