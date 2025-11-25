const UserModel = require("../models/userModel");

// Middleware kiểm tra mật khẩu mặc định
const checkDefaultPassword = async (req, res, next) => {
  try {
    const { maTaiKhoan } = req.user;

    // Kiểm tra xem user có đang dùng mật khẩu mặc định không
    const isDefault = await UserModel.isDefaultPassword(maTaiKhoan);

    // Thêm thông tin vào request để sử dụng ở controller
    req.isDefaultPassword = isDefault;

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra mật khẩu mặc định:", error);
    // Không block request, chỉ log lỗi
    req.isDefaultPassword = false;
    next();
  }
};

// Middleware bắt buộc đổi mật khẩu (dành cho các route quan trọng)
const requirePasswordChange = async (req, res, next) => {
  try {
    const { maTaiKhoan } = req.user;

    const isDefault = await UserModel.isDefaultPassword(maTaiKhoan);

    if (isDefault) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn cần đổi mật khẩu mặc định trước khi sử dụng chức năng này",
        requirePasswordChange: true,
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra mật khẩu mặc định:", error);
    next();
  }
};

module.exports = {
  checkDefaultPassword,
  requirePasswordChange,
};
