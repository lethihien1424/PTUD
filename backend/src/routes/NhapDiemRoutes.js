const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middlewares/auth");
const DiemController = require("../controllers/NhapDiemController");

// Sửa lại: Truyền thẳng hàm (thay vì dùng arrow function)
router.post("/nhap", authenticateToken, DiemController.createOrUpdateGrade);

router.get("/lop/:maLop", authenticateToken, DiemController.getClassGrades);

module.exports = router;