const { pool } = require("../config/db");
const crypto = require("crypto");

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
            SELECT hs.maHocSinh, hs.hoTen, hs.ngaySinh, hs.gioiTinh, hs.namHoc, hs.maLop, l.tenLop, l.khoi, hs.diaChi, hs.tinhTrang, hs.anhChanDung
            FROM hocsinh hs
            LEFT JOIN lop l ON hs.maLop = l.maLop
            WHERE hs.maTaiKhoan = ?
          `;
          break;
        case "giaovien":
          tableName = "giaovien";
          query = `
            SELECT gv.*, tk.tenDangNhap
            FROM giaovien gv
            LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
            WHERE gv.maTaiKhoan = ?
          `;
          break;
        case "gvcn":
          tableName = "giaovien";
          query = `
            SELECT gv.*, tk.tenDangNhap, l.tenLop as lopChuNhiem, l.khoi as khoiChuNhiem, l.siSo as siSoChuNhiem, t.tenTruong as tenTruongChuNhiem
            FROM giaovien gv
            LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
            LEFT JOIN lop l ON l.maGVChuNhiem = gv.maGV
            LEFT JOIN truong t ON l.maTruong = t.maTruong
            WHERE gv.maTaiKhoan = ?
          `;
          break;
        case "phuhuynh":
          tableName = "phuhuynh";
          query = `
            SELECT ph.*, hs.hoTen as tenCon, hs.maHocSinh, hs.ngaySinh as ngaySinhCon, hs.gioiTinh as gioiTinhCon, hs.maLop as maLopCon, hs.diaChi as diaChiCon, hs.tinhTrang as tinhTrangCon
            FROM phuhuynh ph
            LEFT JOIN hocsinh hs ON ph.maPhuHuynh = hs.maPhuHuynh
            WHERE ph.maTaiKhoan = ?
          `;
          break;
        default:
          return {};
      }

      const [rows] = await pool.execute(query, [maTaiKhoan]);
      // Trả về object chi tiết, nếu không có thì trả về object rỗng
      return rows[0] || {};
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

      // Kiểm tra mật khẩu - hỗ trợ cả plain text và MD5 hash
      const hashedPassword = crypto
        .createHash("md5")
        .update(matKhau)
        .digest("hex");
      // So sánh hashedPassword với cột matKhau trong database

      // So sánh với cả plain text và hash
      const isPasswordValid =
        user.matKhau === matKhau || user.matKhau === hashedPassword;

      if (!isPasswordValid) {
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
          details: userDetails, // phải có dòng này
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

  // Tạo tài khoản mặc định
  static async createDefaultAccount(
    maTaiKhoan,
    tenDangNhap,
    matKhau,
    loaiTaiKhoan
  ) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO taikhoan (maTaiKhoan, tenDangNhap, matKhau, loaiTaiKhoan, isDefaultPassword) VALUES (?, ?, ?, ?, 1)",
        [maTaiKhoan, tenDangNhap, matKhau, loaiTaiKhoan]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi khi tạo tài khoản mặc định: " + error.message);
    }
  }

  // Đổi mật khẩu
  static async changePassword(maTaiKhoan, oldPassword, newPassword) {
    try {
      // Lấy user hiện tại
      const user = await this.findById(maTaiKhoan);
      if (!user) {
        return { success: false, message: "Không tìm thấy tài khoản" };
      }

      // Luôn so sánh với bản mã hóa MD5
      const hashedOld = crypto
        .createHash("md5")
        .update(oldPassword)
        .digest("hex");
      if (user.matKhau !== hashedOld) {
        return { success: false, message: "Mật khẩu cũ không đúng" };
      }

      // Kiểm tra mật khẩu mới phải khác mật khẩu cũ
      const hashedNew = crypto
        .createHash("md5")
        .update(newPassword)
        .digest("hex");
      if (hashedNew === user.matKhau) {
        return {
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu cũ",
        };
      }

      // Kiểm tra mẫu mật khẩu mới
      // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return {
          success: false,
          message:
            "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
        };
      }

      // Cập nhật mật khẩu mới (mã hóa MD5)
      await pool.execute(
        "UPDATE taikhoan SET matKhau = ?, isDefaultPassword = 0 WHERE maTaiKhoan = ?",
        [hashedNew, maTaiKhoan]
      );

      return { success: true, message: "Đổi mật khẩu thành công" };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi đổi mật khẩu: " + error.message,
      };
    }
  }
}

module.exports = UserModel;
