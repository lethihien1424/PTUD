const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");

// Routes công khai (không cần xác thực)
router.post("/login", AuthController.login);

// Routes cần xác thực
router.use(authenticateToken); // Áp dụng middleware xác thực cho tất cả routes phía dưới

router.get("/profile", AuthController.getProfile);
router.post("/logout", AuthController.logout);
router.get("/check-auth", AuthController.checkAuth);
router.post("/refresh-token", AuthController.refreshToken);

module.exports = router;
