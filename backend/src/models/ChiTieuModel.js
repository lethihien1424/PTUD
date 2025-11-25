const { pool } = require("../config/db"); 

class ChiTieuModel {
    static async upsertChiTieu(data) {
        try {
            const { maTruong, namHoc, soLuong } = data;

            // 1. TẠO ID MỚI (Logic mã tự động CT001,...)
            const [rows] = await pool.query("SELECT MAX(maChiTieu) AS maxMa FROM chitieutuyensinh");
            let newId = "CT001";
            if (rows[0].maxMa) {
                const num = parseInt(rows[0].maxMa.replace("CT", "")) + 1;
                newId = "CT" + num.toString().padStart(3, "0");
            }
            
            // 2. KIỂM TRA TỒN TẠI VÀ THỰC HIỆN UPSERT
            const [exist] = await pool.query(
                "SELECT maChiTieu FROM chitieutuyensinh WHERE maTruong=? AND namHoc=?",
                [maTruong, namHoc]
            );

            if (exist.length > 0) {
                await pool.query(
                    "UPDATE chitieutuyensinh SET soLuong=? WHERE maChiTieu=?",
                    [soLuong, exist[0].maChiTieu]
                );
                return { action: 'UPDATE', maChiTieu: exist[0].maChiTieu };
            } else {
                await pool.query(
                    "INSERT INTO chitieutuyensinh (maChiTieu, namHoc, soLuong, maTruong) VALUES (?, ?, ?, ?)",
                    [newId, namHoc, soLuong, maTruong]
                );
                return { action: 'INSERT', maChiTieu: newId };
            }
        } catch (error) {
            throw new Error(`Lỗi DB khi UPSERT chỉ tiêu: ${error.message}`);
        }
    }

    static async getQuota(maTruong, namHoc) {
        try {
            const [quota] = await pool.query(
                "SELECT soLuong FROM chitieutuyensinh WHERE maTruong=? AND namHoc=?",
                [maTruong, namHoc]
            );
            return quota[0] ? quota[0].soLuong : null;
        } catch (error) {
            throw new Error(`Lỗi DB khi lấy chỉ tiêu: ${error.message}`);
        }
    }
}

module.exports = ChiTieuModel;