const { pool } = require("../config/db");

class UserModel {
  // Tìm user theo tên đăng nhập
  static async findByUsername(tenDangNhap) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM taikhoan WHERE tenDangNhap = ?",
        [tenDangNhap]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi tìm user: " + error.message);
    }
  }

  // Tìm user theo ID tài khoản
  static async findById(maTaiKhoan) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM taikhoan WHERE maTaiKhoan = ?",
        [maTaiKhoan]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi tìm user theo ID: " + error.message);
    }
  }

  // Lấy thông tin chi tiết user theo loại tài khoản
  static async getUserDetails(maTaiKhoan, loaiTaiKhoan) {
    try {
      let query = "";
      let tableName = "";

      switch (loaiTaiKhoan) {
        case "hocsinh":
          tableName = "hocsinh";
          query = `
                        SELECT hs.*, l.tenLop, l.khoi, t.tenTruong
                        FROM hocsinh hs
                        LEFT JOIN lop l ON hs.maLop = l.maLop
                        LEFT JOIN truong t ON l.maTruong = t.maTruong
                        WHERE hs.maTaiKhoan = ?
                    `;
          break;
        case "giaovien":
        case "gvcn":
          tableName = "giaovien";
          query = `
                        SELECT gv.*
                        FROM giaovien gv
                        WHERE gv.maTaiKhoan = ?
                    `;
          break;
        case "phuhuynh":
          tableName = "phuhuynh";
          query = `
                        SELECT ph.*, hs.hoTen as tenCon, hs.maHocSinh
                        FROM phuhuynh ph
                        LEFT JOIN hocsinh hs ON ph.maPhuHuynh = hs.maPhuHuynh
                        WHERE ph.maTaiKhoan = ?
                    `;
          break;
        default:
          return null;
      }

      const [rows] = await pool.execute(query, [maTaiKhoan]);
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin chi tiết user: " + error.message);
    }
  }

  // Xác thực đăng nhập
  static async authenticate(tenDangNhap, matKhau) {
    try {
      const user = await this.findByUsername(tenDangNhap);

      if (!user) {
        return { success: false, message: "Tên đăng nhập không tồn tại" };
      }

      // Kiểm tra mật khẩu (trong thực tế nên hash mật khẩu)
      if (user.matKhau !== matKhau) {
        return { success: false, message: "Mật khẩu không chính xác" };
      }

      // Lấy thông tin chi tiết
      const userDetails = await this.getUserDetails(
        user.maTaiKhoan,
        user.loaiTaiKhoan
      );

      return {
        success: true,
        user: {
          maTaiKhoan: user.maTaiKhoan,
          tenDangNhap: user.tenDangNhap,
          loaiTaiKhoan: user.loaiTaiKhoan,
          details: userDetails,
        },
      };
    } catch (error) {
      throw new Error("Lỗi xác thực: " + error.message);
    }
  }

  // Cập nhật thời gian đăng nhập cuối
  static async updateLastLogin(maTaiKhoan) {
    try {
      const [result] = await pool.execute(
        "UPDATE taikhoan SET lastLogin = NOW() WHERE maTaiKhoan = ?",
        [maTaiKhoan]
      );
      return result.affectedRows > 0;
    } catch (error) {
      // Nếu cột lastLogin chưa tồn tại, có thể bỏ qua lỗi này
      console.warn("Không thể cập nhật lastLogin:", error.message);
      return false;
    }
  }

  // Lấy danh sách tất cả users (cho admin)
  static async getAllUsers() {
    try {
      const [rows] = await pool.execute(
        "SELECT maTaiKhoan, tenDangNhap, loaiTaiKhoan FROM taikhoan ORDER BY loaiTaiKhoan, tenDangNhap"
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách users: " + error.message);
    }
  }
}

module.exports = UserModel;
