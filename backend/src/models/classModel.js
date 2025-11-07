const { pool } = require("../config/db");

class ClassModel {
  // Lấy thông tin lớp theo mã lớp
  static async getClassById(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, t.tenTruong, gv.hoTen as tenGiaoVienChuNhiem
         FROM lop l
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         LEFT JOIN giaovien gv ON l.maGiaoVienChuNhiem = gv.maGiaoVien
         WHERE l.maLop = ?`,
        [maLop]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin lớp: " + error.message);
    }
  }

  // Lấy danh sách học sinh trong lớp
  static async getStudentsByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT hs.maHocSinh, hs.hoTen, hs.mssv, hs.ngaySinh, hs.gioiTinh,
                hs.soDienThoai, hs.email, hs.diaChi,
                ph.hoTen as tenPhuHuynh, ph.soDienThoai as sdtPhuHuynh
         FROM hocsinh hs
         LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
         WHERE hs.maLop = ?
         ORDER BY hs.hoTen`,
        [maLop]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách học sinh: " + error.message);
    }
  }

  // Lấy danh sách lớp theo giáo viên
  static async getClassesByTeacher(maGiaoVien) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, t.tenTruong,
                COUNT(hs.maHocSinh) as soHocSinh
         FROM lop l
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
         WHERE l.maGiaoVienChuNhiem = ?
         GROUP BY l.maLop
         ORDER BY l.tenLop`,
        [maGiaoVien]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp của giáo viên: " + error.message
      );
    }
  }

  // Lấy thống kê tổng quan của lớp
  static async getClassStatistics(maLop, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           COUNT(DISTINCT hs.maHocSinh) as tongHocSinh,
           COUNT(DISTINCT DATE(dd.ngayDiemDanh)) as tongNgayDiemDanh,
           COUNT(dd.maDiemDanh) as tongLuotDiemDanh,
           SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) as tongCoMat,
           SUM(CASE WHEN dd.trangThai = 'vang_mat' THEN 1 ELSE 0 END) as tongVang,
           SUM(CASE WHEN dd.trangThai = 'muon' THEN 1 ELSE 0 END) as tongMuon,
           SUM(CASE WHEN dd.trangThai = 'co_phep' THEN 1 ELSE 0 END) as tongCoPhep,
           ROUND(AVG(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) * 100, 2) as tiLeDiHocTrungBinh
         FROM hocsinh hs
         LEFT JOIN diemداnh dd ON hs.maHocSinh = dd.maHocSinh 
           AND dd.maLop = ? AND DATE(dd.ngayDiemDanh) BETWEEN ? AND ?
         WHERE hs.maLop = ?`,
        [maLop, startDate, endDate, maLop]
      );

      return rows[0] || {};
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê lớp: " + error.message);
    }
  }

  // Lấy danh sách lớp theo trường
  static async getClassesBySchool(maTruong) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, gv.hoTen as tenGiaoVienChuNhiem,
                COUNT(hs.maHocSinh) as soHocSinh
         FROM lop l
         LEFT JOIN giaovien gv ON l.maGiaoVienChuNhiem = gv.maGiaoVien
         LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
         WHERE l.maTruong = ?
         GROUP BY l.maLop
         ORDER BY l.khoi, l.tenLop`,
        [maTruong]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp theo trường: " + error.message
      );
    }
  }

  // Cập nhật thông tin lớp
  static async updateClass(maLop, updateData) {
    const { tenLop, khoi, maGiaoVienChuNhiem } = updateData;

    try {
      const [result] = await pool.execute(
        `UPDATE lop SET tenLop = ?, khoi = ?, maGiaoVienChuNhiem = ? 
         WHERE maLop = ?`,
        [tenLop, khoi, maGiaoVienChuNhiem, maLop]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Cập nhật lớp thành công"
            : "Không tìm thấy lớp",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật lớp: " + error.message);
    }
  }

  // Tạo lớp mới
  static async createClass(classData) {
    const { tenLop, khoi, maTruong, maGiaoVienChuNhiem } = classData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO lop (tenLop, khoi, maTruong, maGiaoVienChuNhiem) 
         VALUES (?, ?, ?, ?)`,
        [tenLop, khoi, maTruong, maGiaoVienChuNhiem]
      );

      return {
        success: true,
        maLop: result.insertId,
        message: "Tạo lớp thành công",
      };
    } catch (error) {
      throw new Error("Lỗi khi tạo lớp: " + error.message);
    }
  }
}

module.exports = ClassModel;
