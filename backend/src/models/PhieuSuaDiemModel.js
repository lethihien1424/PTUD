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

  // Lấy tất cả phiếu (dành cho BGH)
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          p.maPhieu AS id,
          p.diemCu AS oldGrade,
          p.diemDeNghi AS newGrade,
          p.loaiDiem AS gradeType,
          p.lyDo AS reason,
          p.minhChung AS evidence,
          p.ngayGui AS submittedDate,
          p.trangThai AS status,
          p.maGV AS teacherId,
          gv.hoTen AS teacherName,
          p.maDiem,
          d.maHocSinh AS studentId,
          hs.hoTen AS studentName,
          d.maMonHoc AS subjectId,
          mh.tenMonHoc AS subject,
          p.maHocKy
        FROM phieusuadiem p
        LEFT JOIN diem d ON p.maDiem = d.maDiem
        LEFT JOIN hocsinh hs ON d.maHocSinh = hs.maHocSinh
        LEFT JOIN monhoc mh ON d.maMonHoc = mh.maMonHoc
        LEFT JOIN giaovien gv ON p.maGV = gv.maGV
        ORDER BY p.ngayGui DESC`
      );

      return rows;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh sách phiếu sửa điểm: ' + error.message);
    }
  }

  // Cập nhật trạng thái phiếu
  static async updateStatus(maPhieu, newStatus) {
    try {
      const [result] = await pool.execute(
        `UPDATE phieusuadiem SET trangThai = ? WHERE maPhieu = ?`,
        [newStatus, maPhieu]
      );
      return result;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật trạng thái phiếu: ' + error.message);
    }
  }
}

module.exports = PhieuSuaDiemModel;