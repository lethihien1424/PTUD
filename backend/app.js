const express = require("express");
const cors = require("cors");
const { testConnection } = require("./src/config/db");

// Import routes - chỉ import authRoutes để test login
const authRoutes = require("./src/routes/authRoutes");

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

// Routes - chỉ auth routes để test login
app.use("/api/auth", authRoutes);

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
    message: "API hoạt động bình thường - Test login ready",
    endpoints: {
      login: "POST /api/auth/login",
      profile: "GET /api/auth/profile (cần token)",
      health: "GET /api/health",
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
