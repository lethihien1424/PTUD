const { pool } = require("../config/db");

class StudentModel {
  // Lấy thông tin chi tiết học sinh
  static async getStudentById(maHocSinh) {
    try {
      const [rows] = await pool.execute(
        `SELECT hs.*, l.tenLop, l.khoi, t.tenTruong,
                ph.hoTen as tenPhuHuynh, ph.soDienThoai as sdtPhuHuynh,
                ph.email as emailPhuHuynh, ph.diaChi as diaChiPhuHuynh,
                gv.hoTen as tenGiaoVienChuNhiem
         FROM hocsinh hs
         LEFT JOIN lop l ON hs.maLop = l.maLop
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
         LEFT JOIN giaovien gv ON l.maGiaoVienChuNhiem = gv.maGiaoVien
         WHERE hs.maHocSinh = ?`,
        [maHocSinh]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin học sinh: " + error.message);
    }
  }

  // Lấy danh sách học sinh theo lớp (dành cho điểm danh)
  static async getStudentsForAttendance(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT hs.maHocSinh, hs.hoTen, hs.mssv, hs.ngaySinh,
                hs.soDienThoai, hs.email,
                ph.hoTen as tenPhuHuynh, ph.soDienThoai as sdtPhuHuynh
         FROM hocsinh hs
         LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
         WHERE hs.maLop = ? AND hs.trangThai = 'hoat_dong'
         ORDER BY hs.hoTen`,
        [maLop]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách học sinh: " + error.message);
    }
  }

  // Tìm kiếm học sinh theo tên hoặc MSSV
  static async searchStudents(keyword, maLop = null) {
    try {
      let query = `
        SELECT hs.maHocSinh, hs.hoTen, hs.mssv, l.tenLop, l.khoi
        FROM hocsinh hs
        LEFT JOIN lop l ON hs.maLop = l.maLop
        WHERE (hs.hoTen LIKE ? OR hs.mssv LIKE ?)
      `;

      const params = [`%${keyword}%`, `%${keyword}%`];

      if (maLop) {
        query += " AND hs.maLop = ?";
        params.push(maLop);
      }

      query += " ORDER BY hs.hoTen LIMIT 50";

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm học sinh: " + error.message);
    }
  }

  // Lấy thống kê điểm danh của học sinh
  static async getStudentAttendanceStats(maHocSinh, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           COUNT(*) as tongSoBuoi,
           SUM(CASE WHEN trangThai = 'co_mat' THEN 1 ELSE 0 END) as soNgayCoMat,
           SUM(CASE WHEN trangThai = 'vang_mat' THEN 1 ELSE 0 END) as soNgayVang,
           SUM(CASE WHEN trangThai = 'muon' THEN 1 ELSE 0 END) as soNgayMuon,
           SUM(CASE WHEN trangThai = 'co_phep' THEN 1 ELSE 0 END) as soNgayCoPhep,
           ROUND((SUM(CASE WHEN trangThai = 'co_mat' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as tiLeDiHoc
         FROM diemداnh 
         WHERE maHocSinh = ? AND DATE(ngayDiemDanh) BETWEEN ? AND ?`,
        [maHocSinh, startDate, endDate]
      );

      return (
        rows[0] || {
          tongSoBuoi: 0,
          soNgayCoMat: 0,
          soNgayVang: 0,
          soNgayMuon: 0,
          soNgayCoPhep: 0,
          tiLeDiHoc: 0,
        }
      );
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy thống kê điểm danh học sinh: " + error.message
      );
    }
  }

  // Lấy lịch sử điểm danh gần đây của học sinh
  static async getRecentAttendance(maHocSinh, limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT dd.*, l.tenLop, gv.hoTen as tenGiaoVien
         FROM diemداnh dd
         LEFT JOIN lop l ON dd.maLop = l.maLop
         LEFT JOIN giaovien gv ON dd.maGiaoVien = gv.maGiaoVien
         WHERE dd.maHocSinh = ?
         ORDER BY dd.ngayDiemDanh DESC
         LIMIT ?`,
        [maHocSinh, limit]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy lịch sử điểm danh: " + error.message);
    }
  }

  // Cập nhật thông tin học sinh
  static async updateStudent(maHocSinh, updateData) {
    const { hoTen, ngaySinh, gioiTinh, soDienThoai, email, diaChi } =
      updateData;

    try {
      const [result] = await pool.execute(
        `UPDATE hocsinh 
         SET hoTen = ?, ngaySinh = ?, gioiTinh = ?, soDienThoai = ?, email = ?, diaChi = ?
         WHERE maHocSinh = ?`,
        [hoTen, ngaySinh, gioiTinh, soDienThoai, email, diaChi, maHocSinh]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Cập nhật thông tin học sinh thành công"
            : "Không tìm thấy học sinh",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật thông tin học sinh: " + error.message);
    }
  }

  // Chuyển lớp cho học sinh
  static async transferStudent(maHocSinh, maLopMoi) {
    try {
      const [result] = await pool.execute(
        "UPDATE hocsinh SET maLop = ? WHERE maHocSinh = ?",
        [maLopMoi, maHocSinh]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Chuyển lớp thành công"
            : "Không tìm thấy học sinh",
      };
    } catch (error) {
      throw new Error("Lỗi khi chuyển lớp: " + error.message);
    }
  }

  // Lấy danh sách học sinh có tỷ lệ vắng cao
  static async getStudentsWithHighAbsence(
    maLop,
    tiLeVangToiThieu = 20,
    startDate,
    endDate
  ) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           hs.maHocSinh, hs.hoTen, hs.mssv,
           COUNT(dd.maDiemDanh) as tongSoBuoi,
           SUM(CASE WHEN dd.trangThai = 'vang_mat' THEN 1 ELSE 0 END) as soNgayVang,
           ROUND((SUM(CASE WHEN dd.trangThai = 'vang_mat' THEN 1 ELSE 0 END) / COUNT(dd.maDiemDanh)) * 100, 2) as tiLeVang,
           ph.hoTen as tenPhuHuynh, ph.soDienThoai as sdtPhuHuynh
         FROM hocsinh hs
         LEFT JOIN diemداnh dd ON hs.maHocSinh = dd.maHocSinh 
           AND dd.maLop = ? AND DATE(dd.ngayDiemDanh) BETWEEN ? AND ?
         LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
         WHERE hs.maLop = ?
         GROUP BY hs.maHocSinh, hs.hoTen, hs.mssv
         HAVING tiLeVang >= ?
         ORDER BY tiLeVang DESC`,
        [maLop, startDate, endDate, maLop, tiLeVangToiThieu]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách học sinh vắng nhiều: " + error.message
      );
    }
  }

  // Tạo học sinh mới
  static async createStudent(studentData) {
    const {
      hoTen,
      mssv,
      ngaySinh,
      gioiTinh,
      soDienThoai,
      email,
      diaChi,
      maLop,
      maPhuHuynh,
      maTaiKhoan,
    } = studentData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO hocsinh (hoTen, mssv, ngaySinh, gioiTinh, soDienThoai, email, diaChi, maLop, maPhuHuynh, maTaiKhoan, trangThai) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'hoat_dong')`,
        [
          hoTen,
          mssv,
          ngaySinh,
          gioiTinh,
          soDienThoai,
          email,
          diaChi,
          maLop,
          maPhuHuynh,
          maTaiKhoan,
        ]
      );

      return {
        success: true,
        maHocSinh: result.insertId,
        message: "Tạo học sinh thành công",
      };
    } catch (error) {
      throw new Error("Lỗi khi tạo học sinh: " + error.message);
    }
  }
}

module.exports = StudentModel;
