const { pool } = require("../config/db");

class PhieuDanhGiaHanhKiemModel {
  // Kiểm tra giáo viên có được phân công lớp không
  static async isTeacherAssignedToClass(maGV, maLop) {
    const [rows] = await pool.execute(
      `SELECT maPhanCong 
       FROM bangphancong 
       WHERE maGV = ? AND maLop = ? 
       LIMIT 1`,
      [maGV, maLop]
    );
    return rows.length > 0;
  }

  // Lấy thông tin lớp của học sinh
  static async getStudentInfo(maHocSinh) {
    const [rows] = await pool.execute(
      `SELECT maHocSinh, hoTen, maLop, namHoc 
       FROM hocsinh 
       WHERE maHocSinh = ? 
       LIMIT 1`,
      [maHocSinh]
    );
    return rows[0] || null;
  }

  // Lấy danh sách học sinh trong lớp kèm điểm TK trung bình theo học kỳ
  static async getStudentsWithScore(maLop, maHocKy) {
    const [rows] = await pool.execute(
      `SELECT 
          hs.maHocSinh,
          hs.hoTen,
          hs.maLop,
          COALESCE(AVG(d.diemTK), 0) AS diemTK
       FROM hocsinh hs
       LEFT JOIN diem d 
         ON hs.maHocSinh = d.maHocSinh 
        AND d.maHocKy = ?
       WHERE hs.maLop = ?
       GROUP BY hs.maHocSinh, hs.hoTen, hs.maLop
       ORDER BY hs.hoTen`,
      [maHocKy, maLop]
    );
    return rows;
  }

  // Đếm số buổi vắng theo học kỳ (dựa theo năm học trong mã học kỳ)
  static async getAbsenceByClass(maLop, maHocKy) {
    const params = [maLop];
    let yearFilter = "";
    const year = this.extractYearFromHocKy(maHocKy);
    if (year) {
      yearFilter = "AND YEAR(thoiGian) = ?";
      params.push(year);
    }

    const [rows] = await pool.execute(
      `SELECT maHocSinh, COUNT(*) AS soBuoiVang
       FROM kqdiemdanh
       WHERE maLop = ?
         AND trangThai IN ('Vắng', 'Không phép')
         ${yearFilter}
       GROUP BY maHocSinh`,
      params
    );

    return rows;
  }

  static extractYearFromHocKy(maHocKy) {
    if (!maHocKy) return null;
    const parts = maHocKy.split("_");
    const lastPart = parts[parts.length - 1];
    const year = parseInt(lastPart, 10);
    return Number.isNaN(year) ? null : year;
  }

  static async getAverageScoreForStudent(maHocSinh, maHocKy) {
    const [rows] = await pool.execute(
      `SELECT COALESCE(AVG(diemTK), 0) AS diemTK
       FROM diem
       WHERE maHocSinh = ? AND maHocKy = ?`,
      [maHocSinh, maHocKy]
    );
    return rows[0]?.diemTK || 0;
  }

  static async getAbsenceForStudent(maHocSinh, maLop, maHocKy) {
    const params = [maHocSinh, maLop];
    let yearFilter = "";
    const year = this.extractYearFromHocKy(maHocKy);
    if (year) {
      yearFilter = "AND YEAR(thoiGian) = ?";
      params.push(year);
    }

    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS soBuoiVang
       FROM kqdiemdanh
       WHERE maHocSinh = ? 
         AND maLop = ?
         AND trangThai IN ('Vắng', 'Không phép')
         ${yearFilter}`,
      params
    );

    return rows[0]?.soBuoiVang || 0;
  }

  static async saveEvaluation({
    maPhieuHK,
    maHocSinh,
    maGiaoVien,
    loaiHanhKiem,
    nhanXet,
    maHocKy,
  }) {
    await pool.execute(
      `INSERT INTO phieudanhgiahanhkiem 
        (maPhieuHK, maHocSinh, loaiHanhKiem, nhanXet, maGiaoVien, maHocKy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [maPhieuHK, maHocSinh, loaiHanhKiem, nhanXet, maGiaoVien, maHocKy]
    );
  }

  static async getEvaluationsByStudent(maHocSinh) {
    const [rows] = await pool.execute(
      `SELECT maPhieuHK, maHocSinh, maGiaoVien, loaiHanhKiem, nhanXet, maHocKy
       FROM phieudanhgiahanhkiem
       WHERE maHocSinh = ?
       ORDER BY maHocKy DESC`,
      [maHocSinh]
    );
    return rows;
  }
}

module.exports = PhieuDanhGiaHanhKiemModel;

