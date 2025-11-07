const UserModel = require("../models/userModel");
const TeacherModel = require("../models/teacherModel");
const jwt = require("jsonwebtoken");

class AuthController {
  // Đăng nhập
  static async login(req, res) {
    try {
      const { tenDangNhap, matKhau } = req.body;

      // Validate input
      if (!tenDangNhap || !matKhau) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
        });
      }

      // Xác thực người dùng
      const authResult = await UserModel.authenticate(tenDangNhap, matKhau);

      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.message,
        });
      }

      // Tạo JWT token
      const token = jwt.sign(
        {
          maTaiKhoan: authResult.user.maTaiKhoan,
          tenDangNhap: authResult.user.tenDangNhap,
          loaiTaiKhoan: authResult.user.loaiTaiKhoan,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Cập nhật thời gian đăng nhập cuối
      await UserModel.updateLastLogin(authResult.user.maTaiKhoan);

      // Nếu là giáo viên, lấy thêm thông tin chức vụ
      let teacherInfo = null;
      if (
        authResult.user.loaiTaiKhoan === "giaovien" ||
        authResult.user.loaiTaiKhoan === "gvcn"
      ) {
        teacherInfo = await TeacherModel.getTeacherByAccountId(
          authResult.user.maTaiKhoan
        );
      }

      // Trả về kết quả thành công
      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          token,
          user: authResult.user,
          teacherInfo: teacherInfo,
        },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy thông tin profile user
  static async getProfile(req, res) {
    try {
      const { maTaiKhoan } = req.user; // Từ JWT middleware

      const user = await UserModel.findById(maTaiKhoan);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      const userDetails = await UserModel.getUserDetails(
        maTaiKhoan,
        user.loaiTaiKhoan
      );

      // Nếu là giáo viên, lấy thêm thông tin
      let teacherInfo = null;
      if (user.loaiTaiKhoan === "giaovien" || user.loaiTaiKhoan === "gvcn") {
        teacherInfo = await TeacherModel.getTeacherByAccountId(maTaiKhoan);
      }

      res.json({
        success: true,
        data: {
          maTaiKhoan: user.maTaiKhoan,
          tenDangNhap: user.tenDangNhap,
          loaiTaiKhoan: user.loaiTaiKhoan,
          details: userDetails,
          teacherInfo: teacherInfo,
        },
      });
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Đăng xuất
  static async logout(req, res) {
    try {
      res.json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập
  static async checkAuth(req, res) {
    try {
      res.json({
        success: true,
        message: "Token hợp lệ",
        user: req.user,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { maTaiKhoan, tenDangNhap, loaiTaiKhoan } = req.user;

      // Tạo token mới
      const newToken = jwt.sign(
        { maTaiKhoan, tenDangNhap, loaiTaiKhoan },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Refresh token thành công",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      console.error("Lỗi refresh token:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }
}

module.exports = AuthController;
