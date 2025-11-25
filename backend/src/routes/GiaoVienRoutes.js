const express = require("express");
const router = express.Router();
const TeacherController = require("../controllers/GiaoVienController");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

// Áp dụng middleware xác thực cho tất cả routes
router.use(authenticateToken);

// Routes cho quản lý giáo viên với phân quyền chi tiết
router.post("/", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.createTeacher);
router.get("/", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.getTeachers);
router.get("/:maGV", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.getTeacherById);
router.put("/:maGV", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.updateTeacher);
router.delete("/:maGV", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.deleteTeacher);
router.post("/:maGV/reactivate", authorizeRoles('giaovu', 'bangiamhieu'), TeacherController.reactivateTeacher);

module.exports = router;
