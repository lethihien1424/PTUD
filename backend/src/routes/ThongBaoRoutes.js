const express = require("express");
const router = express.Router();
const ThongBaoController = require("../controllers/ThongBaoController");
const { authenticateToken } = require("../middlewares/auth");

// Tất cả các route đều cần đăng nhập
router.use(authenticateToken);

// Học sinh/GV xem danh sách
router.get("/", ThongBaoController.getDanhSach);

// Xem chi tiết (Tự động đánh dấu đã đọc)
router.get("/:id", ThongBaoController.getChiTiet);

// Gửi thông báo (Chỉ Admin/Giáo vụ/BGH - Logic check quyền nằm trong controller)
router.post("/", ThongBaoController.taoThongBao);

module.exports = router;