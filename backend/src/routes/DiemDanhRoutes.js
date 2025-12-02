const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/DiemDanhController");
const AttendanceModel = require("../models/DiemDanhModel");
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
//ms them
router.get(
  "/class/:maLop/report",
  authorizeAttendanceAccess,
  AttendanceController.getAbsenceReportByClass
);

router.get(
  "/class/:maLop/report/year/:year",
  authenticateToken,
  async (req, res) => {
    try {
      const { maLop, year } = req.params;
      const data = await AttendanceModel.getAbsenceReportByClassYear(
        maLop,
        year
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
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

// Routes mới cho thống kê chi tiết vắng học
router.get(
  "/statistics/detailed/:maLop",
  authorizeAttendanceAccess,
  AttendanceController.getDetailedAbsenceStatistics
);

module.exports = router;
