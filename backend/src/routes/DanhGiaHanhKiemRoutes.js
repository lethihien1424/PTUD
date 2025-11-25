const express = require("express");
const router = express.Router();

const DanhGiaHanhKiemController = require("../controllers/DanhGiaHanhKiemController");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

// Áp dụng middleware xác thực + quyền giáo viên
router.use(authenticateToken);
router.use(authorizeRoles("giaovien", "gvcn"));

router.get("/lop/:maLop", DanhGiaHanhKiemController.getDanhSachTheoLop);
router.post("/", DanhGiaHanhKiemController.luuDanhGia);
router.get("/hocsinh/:maHocSinh", DanhGiaHanhKiemController.getDanhGiaHocSinh);

module.exports = router;

