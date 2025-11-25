const express = require("express");
const router = express.Router();
const StudentController = require("../controllers/HocSinhController");
const { authenticateToken } = require("../middlewares/auth");

router.use(authenticateToken);
//Năm
// Lấy danh sách học sinh trong lớp
router.get("/lop/:maLop", StudentController.getStudentsForAttendance);
// Lấy thông tin chi tiết học sinh
router.get("/:id", StudentController.getStudentById);
// Tìm kiếm học sinh
router.get("/", StudentController.searchStudents);
// Thêm học sinh mới
router.post("/", StudentController.createStudent);
// Cập nhật thông tin học sinh
router.put("/:id", StudentController.updateStudent);
// Chuyển lớp học sinh
router.put("/:id/transfer", StudentController.transferStudent);
// XÓA MỀM: Chuyển học sinh sang trạng thái "Đã nghỉ học"
router.delete("/:id",StudentController.softDeleteStudent);
// KHÔI PHỤC học sinh đã bị xóa mềm
router.patch("/:id/restore", StudentController.restoreStudent);

//Tuấn Anh
router.get("/:maHocSinh/profile",StudentController.getStudentProfile);

module.exports = router;