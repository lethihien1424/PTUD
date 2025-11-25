const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");
const User = require("../models/TaiKhoanModel");

// Routes công khai (không cần xác thực)
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);

// Routes cần xác thực
router.use(authenticateToken); // Áp dụng middleware xác thực cho tất cả routes phía dưới

router.get("/profile", AuthController.getProfile);
router.get("/logout", AuthController.logout);
router.get("/check-auth", AuthController.checkAuth);
router.post("/refresh-token", AuthController.refreshToken);

// Chức năng đổi mật khẩu
router.post("/change-password", AuthController.changePassword);
router.get("/check-default-password", AuthController.checkDefaultPassword);

// Chức năng admin
router.post("/reset-password", AuthController.resetPassword);
router.post("/create-account", AuthController.createDefaultAccount);

module.exports = router;
