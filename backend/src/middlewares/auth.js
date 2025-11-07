const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const TeacherModel = require("../models/teacherModel");

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không được cung cấp",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Kiểm tra user còn tồn tại trong database
    const user = await UserModel.findById(decoded.maTaiKhoan);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ - User không tồn tại",
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      maTaiKhoan: decoded.maTaiKhoan,
      tenDangNhap: decoded.tenDangNhap,
      loaiTaiKhoan: decoded.loaiTaiKhoan,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

// Middleware kiểm tra quyền truy cập theo loại tài khoản
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực",
      });
    }

    if (!roles.includes(req.user.loaiTaiKhoan)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    next();
  };
};

// Middleware kiểm tra quyền giáo viên chủ nhiệm
const authorizeHomeRoomTeacher = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực",
      });
    }

    // Kiểm tra loại tài khoản
    if (
      req.user.loaiTaiKhoan !== "giaovien" &&
      req.user.loaiTaiKhoan !== "gvcn"
    ) {
      return res.status(403).json({
        success: false,
        message: "Chỉ giáo viên mới có quyền truy cập",
      });
    }

    // Lấy thông tin giáo viên
    const teacher = await TeacherModel.getTeacherByAccountId(
      req.user.maTaiKhoan
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin giáo viên",
      });
    }

    // Kiểm tra chức vụ chủ nhiệm
    if (teacher.chucVu !== "GVCN") {
      return res.status(403).json({
        success: false,
        message: "Chỉ giáo viên chủ nhiệm mới có quyền thực hiện chức năng này",
      });
    }

    // Gắn thông tin giáo viên vào request
    req.teacher = teacher;
    next();
  } catch (error) {
    console.error("Lỗi middleware phân quyền:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền truy cập",
    });
  }
};

// Middleware kiểm tra quyền truy cập lớp học cho giáo viên chủ nhiệm
const authorizeClassAccess = async (req, res, next) => {
  try {
    const { maLop } = req.params;
    const teacher = req.teacher;

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Thông tin giáo viên không hợp lệ",
      });
    }

    // Kiểm tra giáo viên có phải chủ nhiệm của lớp không
    const hasPermission = await TeacherModel.isHomeRoomTeacherOfClass(
      teacher.maGV,
      maLop
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập lớp này",
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra quyền truy cập lớp:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền truy cập lớp",
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeHomeRoomTeacher,
  authorizeClassAccess,
};
