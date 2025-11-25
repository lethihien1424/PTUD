const { pool } = require("../config/db");

class TKBModel {
  static async createTKB(maPhanCong, tietHoc, maLop) {
    try {
      if (!maLop) {
        throw new Error("Thiếu mã lớp (maLop)");
      }

      // 1. KIỂM TRA PHÂN CÔNG TỒN TẠI + ĐÚNG LỚP
      const [pc] = await pool.execute(
        `SELECT maPhanCong, trangThai, maLop FROM bangphancong WHERE maPhanCong = ?`,
        [maPhanCong]
      );
      if (pc.length === 0) throw new Error("Phân công không tồn tại");
      if (pc[0].trangThai !== "Đã phân công") throw new Error("Phân công chưa được duyệt");

      // SO SÁNH LỚP – AN TOÀN, KHÔNG CÓ undefined
      if (pc[0].maLop !== maLop) {
        throw new Error(`Phân công ${maPhanCong} thuộc lớp ${pc[0].maLop}, không phải ${maLop}`);
      }

      // 2. KIỂM TRA TRÙNG TIẾT
      const [exist] = await pool.execute(
        `SELECT maTKB FROM thoikhoabieu WHERE maPhanCong = ? AND tietHoc = ?`,
        [maPhanCong, tietHoc]
      );
      if (exist.length > 0) throw new Error(`Tiết ${tietHoc} đã được xếp cho phân công này`);

      // 3. TẠO maTKB TỰ ĐỘNG
      const [last] = await pool.execute(`SELECT maTKB FROM thoikhoabieu ORDER BY maTKB DESC LIMIT 1`);
      const newId = last.length === 0 ? 1 : parseInt(last[0].maTKB.slice(3)) + 1;
      const maTKB = `TKB${String(newId).padStart(3, '0')}`;

      // 4. INSERT TKB
      await pool.execute(
        `INSERT INTO thoikhoabieu (maTKB, tietHoc, maPhanCong) VALUES (?, ?, ?)`,
        [maTKB, tietHoc, maPhanCong]
      );

      return { maTKB, tietHoc, maPhanCong, maLop };
    } catch (error) {
      throw error;
    }
  }

  // XEM TKB THEO LỚP
  static async getTKBByLop(maLop) {
    const [rows] = await pool.execute(
      `SELECT 
          tkb.maTKB, tkb.tietHoc,
          pc.maGV, gv.hoTen AS tenGV,
          pc.maMonHoc, mh.tenMonHoc,
          pc.maLop, l.tenLop
       FROM thoikhoabieu tkb
       JOIN bangphancong pc ON tkb.maPhanCong = pc.maPhanCong
       JOIN giaovien gv ON pc.maGV = gv.maGV
       JOIN monhoc mh ON pc.maMonHoc = mh.maMonHoc
       JOIN lop l ON pc.maLop = l.maLop
       WHERE pc.maLop = ?
       ORDER BY tkb.tietHoc`,
      [maLop]
    );
    return rows;
  }

  // XÓA TKB
  static async deleteTKB(maTKB) {
    const [result] = await pool.execute(`DELETE FROM thoikhoabieu WHERE maTKB = ?`, [maTKB]);
    return result.affectedRows > 0;
  }
}

module.exports = TKBModel;