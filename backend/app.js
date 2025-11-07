const express = require("express");
const cors = require("cors");
const { testConnection } = require("./src/config/db");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");

const app = express();

// Middleware cơ bản
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend URLs
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server đang hoạt động",
    timestamp: new Date().toISOString(),
  });
});

// Test API endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message:
      "API hoạt động bình thường - Hệ thống đăng nhập & quản lý giáo viên",
    endpoints: {
      // Auth endpoints (công khai)
      login: "POST /api/auth/login",
      forgotPassword: "POST /api/auth/forgot-password (tên đăng nhập + email)",

      // Auth endpoints (cần đăng nhập)
      profile: "GET /api/auth/profile",
      changePassword: "POST /api/auth/change-password",
      checkDefaultPassword: "GET /api/auth/check-default-password",
      resetPassword: "POST /api/auth/reset-password (chỉ giáo vụ)",

      // Teacher endpoints (chỉ giáo vụ)
      createTeacher: "POST /api/teachers (tự động tạo tài khoản)",
      getTeachers:
        "GET /api/teachers?showInactive=true (giáo vụ xem cả nghỉ việc)",
      getTeacherById: "GET /api/teachers/:maGV",
      updateTeacher: "PUT /api/teachers/:maGV",
      deleteTeacher:
        "DELETE /api/teachers/:maGV (xóa mềm - chỉ đổi trạng thái)",
      reactivateTeacher: "POST /api/teachers/:maGV/reactivate (tái kích hoạt)",
    },
    permissions: {
      giaovu:
        "Thêm/sửa/xóa (soft delete) giáo viên, reset mật khẩu, tạo tài khoản",
      giaovien: "Xem thông tin cá nhân, đổi mật khẩu",
      gvcn: "Quyền giáo viên + quản lý lớp chủ nhiệm",
      all: "Đăng nhập, đổi mật khẩu, quên mật khẩu",
    },
    features: {
      autoAccountCreation: "Tự động tạo tài khoản khi thêm giáo viên",
      defaultPassword: "Mật khẩu mặc định từ 6 số cuối SĐT hoặc 123456",
      forcePasswordChange: "Bắt buộc đổi mật khẩu lần đầu đăng nhập",
      forgotPassword: "Quên mật khẩu bằng tên đăng nhập + email",
      softDelete: "Xóa mềm giáo viên - chỉ thay đổi trạng thái nghỉ làm",
      reactivate: "Tái kích hoạt giáo viên đã nghỉ việc",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
  });
});

// Test database connection when app starts
testConnection();

module.exports = app;
