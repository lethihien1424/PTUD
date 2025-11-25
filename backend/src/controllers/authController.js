const UserModel = require("../models/TaiKhoanModel");
const TeacherModel = require("../models/GiaoVienModel");
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
        try {
          teacherInfo = await TeacherModel.getTeacherByAccountId(
            authResult.user.maTaiKhoan
          );
        } catch (err) {
          console.error("Lỗi lấy thông tin giáo viên:", err);
          teacherInfo = null; // Nếu lỗi, trả về null
        }
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

  // Đổi mật khẩu
  static async changePassword(req, res) {
    try {
      // Nếu là admin/giaovu thì cho phép truyền maTaiKhoan, còn lại lấy từ token
      let maTaiKhoan = req.user.maTaiKhoan;
      const {
        oldPassword,
        newPassword,
        confirmPassword,
        maTaiKhoan: maTKBody,
      } = req.body;
      const { loaiTaiKhoan } = req.user;

      // Nếu là admin/giaovu và có truyền maTaiKhoan thì cho phép đổi cho tài khoản khác
      if (
        (loaiTaiKhoan === "bangiamhieu" || loaiTaiKhoan === "giaovu") &&
        maTKBody
      ) {
        maTaiKhoan = maTKBody;
      }

      // Kiểm tra đầu vào
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      // Đổi mật khẩu
      const result = await UserModel.changePassword(
        maTaiKhoan,
        oldPassword,
        newPassword
      );

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Kiểm tra trạng thái mật khẩu mặc định
  static async checkDefaultPassword(req, res) {
    try {
      const { maTaiKhoan } = req.user;

      const isDefault = await UserModel.isDefaultPassword(maTaiKhoan);

      res.json({
        success: true,
        isDefaultPassword: isDefault,
        message: isDefault
          ? "Bạn đang sử dụng mật khẩu mặc định. Vui lòng đổi mật khẩu!"
          : "Mật khẩu đã được thay đổi",
      });
    } catch (error) {
      console.error("Lỗi kiểm tra mật khẩu mặc định:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Reset mật khẩu (chỉ dành cho admin)
  static async resetPassword(req, res) {
    try {
      const { targetUserId, newPassword } = req.body;
      const { loaiTaiKhoan } = req.user;

      // Chỉ admin hoặc ban giám hiệu mới được reset mật khẩu
      if (!["bangiamhieu", "giaovu"].includes(loaiTaiKhoan)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện chức năng này",
        });
      }

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn tài khoản cần reset",
        });
      }

      const result = await UserModel.resetPassword(targetUserId, newPassword);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          newPassword: result.newPassword,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi reset mật khẩu:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Tạo tài khoản mặc định (khi thêm user mới)
  static async createDefaultAccount(req, res) {
    try {
      const { hoTen, loaiTaiKhoan, email, phone } = req.body;
      const { loaiTaiKhoan: userRole } = req.user;

      // Chỉ admin hoặc ban giám hiệu mới được tạo tài khoản
      if (!["bangiamhieu", "giaovu"].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện chức năng này",
        });
      }

      // Validate input
      if (!hoTen || !loaiTaiKhoan) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ họ tên và loại tài khoản",
        });
      }

      const result = await UserModel.createDefaultAccount({
        hoTen,
        loaiTaiKhoan,
        email,
        phone,
      });

      if (result.success) {
        res.json({
          success: true,
          message: "Tạo tài khoản thành công",
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi tạo tài khoản:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Quên mật khẩu - kiểm tra thông tin
  static async forgotPassword(req, res) {
    try {
      const { tenDangNhap, email } = req.body;

      // Validate input
      if (!tenDangNhap || !email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ tên đăng nhập và email",
        });
      }

      // Kiểm tra tên đăng nhập có tồn tại không
      const user = await UserModel.findByUsername(tenDangNhap);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Tên đăng nhập không tồn tại",
        });
      }

      // Lấy thông tin email của user
      let userEmail = null;
      if (user.loaiTaiKhoan === "giaovien" || user.loaiTaiKhoan === "gvcn") {
        const teacherInfo = await TeacherModel.getTeacherByAccountId(
          user.maTaiKhoan
        );
        userEmail = teacherInfo?.email;
      }

      // Kiểm tra email có khớp không
      if (!userEmail || userEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: "Email không khớp với tài khoản",
        });
      }

      // Tạo mật khẩu mới ngẫu nhiên
      const newPassword = this.generateRandomPassword();

      // Reset mật khẩu
      const resetResult = await UserModel.resetPassword(
        user.maTaiKhoan,
        newPassword
      );

      if (resetResult.success) {
        res.json({
          success: true,
          message: "Đặt lại mật khẩu thành công",
          data: {
            newPassword: newPassword,
            message:
              "Mật khẩu mới của bạn là: " +
              newPassword +
              ". Vui lòng đăng nhập và đổi mật khẩu ngay.",
          },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Không thể đặt lại mật khẩu",
        });
      }
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Tạo mật khẩu ngẫu nhiên
  static generateRandomPassword() {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = AuthController;
