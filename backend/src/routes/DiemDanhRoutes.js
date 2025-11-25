const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/DiemDanhController");
const {
  authenticateToken,
  authorizeEducationOfficer,
  authorizeAttendanceAccess,
} = require("../middlewares/auth");

// Middleware xác thực cho tất cả routes
router.use(authenticateToken);

// Routes cho giáo vụ (chỉ giáo vụ mới có quyền)
router.post(
  "/",
  authorizeEducationOfficer,
  AttendanceController.createAttendance
);
router.put(
  "/:maDiemDanh",
  authorizeEducationOfficer,
  AttendanceController.updateAttendance
);
router.delete(
  "/:maDiemDanh",
  authorizeEducationOfficer,
  AttendanceController.deleteAttendance
);
router.post(
  "/bulk",
  authorizeEducationOfficer,
  AttendanceController.bulkCreateAttendance
);

// Routes cho cả giáo vụ và giáo viên chủ nhiệm
router.get(
  "/class/:maLop/date/:ngayDiemDanh",
  authorizeAttendanceAccess,
  AttendanceController.getAttendanceByClassAndDate
);
router.get(
  "/statistics/:maLop",
  authorizeAttendanceAccess,
  AttendanceController.getAttendanceStatistics
);
router.get(
  "/student/:maHocSinh/history",
  authorizeAttendanceAccess,
  AttendanceController.getStudentAttendanceHistory
);
router.get(
  "/class/:maLop/students",
  authorizeAttendanceAccess,
  AttendanceController.getStudentsInClass
);
router.get(
  "/class/:maLop/history",
  authorizeAttendanceAccess,
  AttendanceController.getAttendanceHistoryByClass
);
router.get(
  "/class/:maLop",
  authorizeAttendanceAccess,
  AttendanceController.getAllAttendanceByClass
);

// Routes cho giáo viên chủ nhiệm
router.get(
  "/teacher/classes",
  authorizeAttendanceAccess,
  AttendanceController.getClassesForHomeRoomTeacher
);

// Routes chỉ cho giáo vụ
router.get(
  "/classes/all",
  authorizeEducationOfficer,
  AttendanceController.getAllClasses
);

router.post("/confirm", AttendanceController.confirmAttendance);

module.exports = router;
