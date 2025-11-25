const express = require("express");
const router = express.Router();

const SuaDiemController = require("../controllers/SuaDiemController");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

router.use(authenticateToken);
router.use(authorizeRoles("giaovien", "gvcn"));

router.get("/hocky", SuaDiemController.getDanhSachHocKy);
router.get("/mon", SuaDiemController.getDanhSachMonTheoHocKy);
router.get(
  "/lop/:maLop/mon/:maMonHoc",
  SuaDiemController.getDanhSachDiemTheoLopMonHocKy
);
router.get("/diem/:maDiem", SuaDiemController.getChiTietDiem);
router.post("/", SuaDiemController.guiYeuCauSuaDiem);

module.exports = router;

