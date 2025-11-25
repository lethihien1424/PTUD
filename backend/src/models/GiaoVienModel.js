const { pool } = require("../config/db");

class TeacherModel {
  // Lấy thông tin giáo viên theo ID tài khoản
  static async getTeacherByAccountId(maTaiKhoan) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM giaovien WHERE maTaiKhoan = ?",
        [maTaiKhoan]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin giáo viên: " + error.message);
    }
  }

  // Lấy thông tin giáo viên theo mã giáo viên
  static async getTeacherById(maGV) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM giaovien WHERE maGV = ?",
        [maGV]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy thông tin giáo viên theo ID: " + error.message
      );
    }
  }

  // Lấy danh sách giáo viên
  static async getAllTeachers() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM giaovien WHERE trangThai = 1 ORDER BY hoTen"
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên: " + error.message);
    }
  }

  // Tạo giáo viên mới
  static async createTeacher(teacherData) {
    try {
      const {
        maGV,
        hoTen,
        CCCD,
        diaChi,
        ngayBatDau,
        chuyenMon,
        chucVu,
        SDT,
        maTaiKhoan,
        email = "",
      } = teacherData;

      const [result] = await pool.execute(
        `INSERT INTO giaovien (maGV, hoTen, CCCD, diaChi, ngayBatDau, chuyenMon, chucVu, trangThai, SDT, maTaiKhoan, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [
          maGV,
          hoTen,
          CCCD,
          diaChi,
          ngayBatDau,
          chuyenMon,
          chucVu,
          SDT,
          maTaiKhoan,
          email,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi tạo giáo viên: " + error.message);
    }
  }

  // Cập nhật thông tin giáo viên
  static async updateTeacher(maGV, updateData) {
    try {
      const { hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email, trangThai } =
        updateData;

      const [result] = await pool.execute(
        `UPDATE giaovien SET hoTen = ?, CCCD = ?, diaChi = ?, chuyenMon = ?, chucVu = ?, SDT = ?, email = ?, trangThai = ?
         WHERE maGV = ?`,
        [hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email, trangThai, maGV]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật giáo viên: " + error.message);
    }
  }

  // Xóa giáo viên (soft delete)
  static async deleteTeacher(maGV) {
    try {
      const [result] = await pool.execute(
        "UPDATE giaovien SET trangThai = 0 WHERE maGV = ?",
        [maGV]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi xóa giáo viên: " + error.message);
    }
  }

  // Kiểm tra giáo viên có phải chủ nhiệm của lớp không
  static async isHomeRoomTeacherOfClass(maGV, maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 FROM lop WHERE maLop = ? AND maGVChuNhiem = ?`,
        [maLop, maGV]
      );
      return rows.length > 0;
    } catch (error) {
      throw new Error(
        "Lỗi khi kiểm tra giáo viên chủ nhiệm lớp: " + error.message
      );
    }
  }
}

module.exports = TeacherModel;
