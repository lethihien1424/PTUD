const { pool } = require("../config/db");

class PhieuSuaDiemModel {
  // Kiểm tra đã có phiếu chờ duyệt hay chưa
  static async hasPendingRequest(maDiem, loaiDiem, maHocKy) {
    const [rows] = await pool.execute(
      `SELECT maPhieu 
       FROM phieusuadiem 
       WHERE maDiem = ? 
         AND loaiDiem = ? 
         AND maHocKy = ? 
         AND trangThai = 'Chờ duyệt'
       LIMIT 1`,
      [maDiem, loaiDiem, maHocKy]
    );
    return rows.length > 0;
  }

  // Tạo phiếu sửa điểm
  static async createRequest({
    maPhieu,
    diemCu,
    diemDeNghi,
    loaiDiem,
    lyDo,
    minhChung,
    maGV,
    maDiem,
    maHocKy,
  }) {
    await pool.execute(
      `INSERT INTO phieusuadiem 
        (maPhieu, diemCu, diemDeNghi, loaiDiem, lyDo, minhChung, ngayGui, trangThai, maGV, maDiem, maHocKy)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Chờ duyệt', ?, ?, ?)`,
      [
        maPhieu,
        diemCu,
        diemDeNghi,
        loaiDiem,
        lyDo,
        minhChung,
        maGV,
        maDiem,
        maHocKy,
      ]
    );
  }
}

module.exports = PhieuSuaDiemModel;