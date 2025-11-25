const jwt = require("jsonwebtoken");
const User = require("../models/TaiKhoanModel");
const TeacherModel = require("../models/GiaoVienModel");
const { pool } = require("../config/db");
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
    const user = await User.findById(decoded.maTaiKhoan);
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
//-----------------------------------------------------------
    // Nếu là học sinh → tự động lấy mã học sinh và lớp
    if (req.user.loaiTaiKhoan === "hocsinh") {
      const [rows] = await pool.execute(
        "SELECT maHocSinh, maLop FROM hocsinh WHERE maTaiKhoan = ?",
        [req.user.maTaiKhoan]
      );

      if (rows.length > 0) {
        req.user.maHocSinh = rows[0].maHocSinh;
        req.user.maLop = rows[0].maLop;
      } else {
        console.log("Không tìm thấy học sinh cho tài khoản:", req.user.maTaiKhoan);
      }
    }else if (user.loaiTaiKhoan === "giaovien" || user.loaiTaiKhoan === "gvcn") {
      const [teacherInfo] = await pool.execute(
        `SELECT 
            gv.maGV, 
            bpc.maMonHoc 
         FROM giaovien gv
         LEFT JOIN bangphancong bpc ON gv.maGV = bpc.maGV
         WHERE gv.maTaiKhoan = ?
         LIMIT 1`, 
        [user.maTaiKhoan]
      );

      if (teacherInfo.length > 0) {
        req.user.maGiaoVien = teacherInfo[0].maGV;
        req.user.maMonHoc = teacherInfo[0].maMonHoc; 
      } else {
         return res
          .status(403)
          .json({ message: "Không tìm thấy thông tin giáo viên liên kết." });
      }
    }
//-----------------------------------------------------------
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

// Middleware kiểm tra quyền giáo vụ
const authorizeEducationOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Chưa xác thực",
    });
  }

  if (req.user.loaiTaiKhoan !== "giaovu") {
    return res.status(403).json({
      success: false,
      message: "Chỉ giáo vụ mới có quyền truy cập",
    });
  }

  next();
};

// Middleware kiểm tra quyền điểm danh (giáo vụ hoặc giáo viên chủ nhiệm)
const authorizeAttendanceAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực",
      });
    }

    // Giáo vụ có toàn quyền
    if (req.user.loaiTaiKhoan === "giaovu") {
      return next();
    }

    // Giáo viên cần kiểm tra thêm
    if (
      req.user.loaiTaiKhoan === "giaovien" ||
      req.user.loaiTaiKhoan === "gvcn"
    ) {
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

      // Gắn thông tin giáo viên vào request
      req.teacher = teacher;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập chức năng điểm danh",
    });
  } catch (error) {
    console.error("Lỗi middleware phân quyền điểm danh:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền truy cập",
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeHomeRoomTeacher,
  authorizeClassAccess,
  authorizeEducationOfficer,
  authorizeAttendanceAccess,
};
