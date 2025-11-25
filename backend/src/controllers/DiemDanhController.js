const DiemDanhModel = require("../models/DiemDanhModel");
const LopModel = require("../models/LopModel");
const HocSinhModel = require("../models/HocSinhModel");
const GiaoVienModel = require("../models/GiaoVienModel");
const { v4: uuidv4 } = require("uuid");

const validStatuses = ["Vắng", "Có phép", "Không phép"];

class AttendanceController {
  // Lấy danh sách điểm danh theo lớp và ngày (cho giáo vụ)
  static async getAttendanceByClassAndDate(req, res) {
    try {
      const { maLop, ngayDiemDanh } = req.params;

      // Kiểm tra quyền truy cập dựa trên loại tài khoản
      if (req.user.loaiTaiKhoan === "giaovu") {
        // Giáo vụ có quyền xem tất cả lớp
        const attendance = await DiemDanhModel.getAttendanceByClassAndDate(
          maLop,
          ngayDiemDanh
        );

        return res.status(200).json({
          success: true,
          data: attendance,
          message: "Lấy danh sách điểm danh thành công",
        });
      } else if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Giáo viên chủ nhiệm chỉ xem lớp của mình
        const attendance =
          await DiemDanhModel.getAttendanceByClassAndDateForHomeRoomTeacher(
            maLop,
            ngayDiemDanh,
            req.teacher.maGV
          );

        return res.status(200).json({
          success: true,
          data: attendance,
          message: "Lấy danh sách điểm danh thành công",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Tạo điểm danh mới (chỉ giáo vụ)
  static async createAttendance(req, res) {
    try {
      const { maHocSinh, maLop, ngayDiemDanh, trangThai, ghiChu } = req.body;

      // Chỉ giáo vụ mới có quyền tạo điểm danh
      if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền điểm danh",
        });
      }

      // Validate dữ liệu đầu vào
      if (!maHocSinh || !maLop || !ngayDiemDanh || !trangThai) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      // Kiểm tra trạng thái hợp lệ
      if (!validStatuses.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái điểm danh không hợp lệ",
        });
      }

      // Nếu trạng thái là "Có phép" và không có ghi chú thì yêu cầu chọn lý do
      if (trangThai === "Có phép" && (!ghiChu || ghiChu.trim() === "")) {
        return res.status(400).json({
          success: false,
          message:
            "Vui lòng chọn lý do: 'Việc gia đình' hoặc 'Ốm' cho trường hợp vắng có phép!",
          lyDoMacDinh: ["Việc gia đình", "Ốm"],
        });
      }

      // Kiểm tra học sinh có tồn tại không
      const student = await HocSinhModel.getStudentById(maHocSinh);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh",
        });
      }

      // Kiểm tra lớp có tồn tại không
      const classInfo = await LopModel.getClassById(maLop);
      if (!classInfo) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lớp học",
        });
      }

      // Kiểm tra điểm danh đã tồn tại chưa
      const existingAttendance = await DiemDanhModel.checkAttendanceExists(
        maHocSinh,
        maLop,
        ngayDiemDanh
      );

      if (existingAttendance) {
        return res.status(409).json({
          success: false,
          message: "Điểm danh cho học sinh này trong ngày đã tồn tại",
          maDiemDanh: existingAttendance.maDiemDanh,
        });
      }

      // Sinh mã điểm danh duy nhất
      const maDiemDanh = "DD" + Date.now() + Math.floor(Math.random() * 1000);
      const attendanceData = {
        maDiemDanh,
        maHocSinh,
        maLop,
        ngayDiemDanh,
        trangThai,
        ghiChu: ghiChu || null,
        maGiaoVien: null, // Giáo vụ không phải giáo viên
      };

      const result = await DiemDanhModel.createAttendance(attendanceData);

      return res.status(201).json({
        success: true,
        data: result,
        message: "Tạo điểm danh thành công",
      });
    } catch (error) {
      console.error("Lỗi tạo điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Cập nhật điểm danh (chỉ giáo vụ)
  static async updateAttendance(req, res) {
    try {
      const { maDiemDanh } = req.params;
      const { trangThai, ghiChu } = req.body;

      // Chỉ giáo vụ mới có quyền cập nhật điểm danh
      if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền cập nhật điểm danh",
        });
      }

      // Validate dữ liệu
      if (!trangThai) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái điểm danh không được để trống",
        });
      }

      if (!validStatuses.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái điểm danh không hợp lệ",
        });
      }

      const updateData = { trangThai, ghiChu };
      const result = await DiemDanhModel.updateAttendance(
        maDiemDanh,
        updateData
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      console.error("Lỗi cập nhật điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Điểm danh hàng loạt (chỉ giáo vụ)
  static async bulkCreateAttendance(req, res) {
    try {
      const { attendanceList } = req.body;

      // Chỉ giáo vụ mới có quyền điểm danh hàng loạt
      if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền điểm danh hàng loạt",
        });
      }

      // Validate dữ liệu
      if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Danh sách điểm danh không hợp lệ",
        });
      }

      // Validate từng item trong danh sách
      for (const attendance of attendanceList) {
        if (
          !attendance.maHocSinh ||
          !attendance.maLop ||
          !attendance.ngayDiemDanh ||
          !attendance.trangThai
        ) {
          return res.status(400).json({
            success: false,
            message: "Thiếu thông tin bắt buộc trong danh sách điểm danh",
          });
        }

        if (!validStatuses.includes(attendance.trangThai)) {
          return res.status(400).json({
            success: false,
            message: `Trạng thái điểm danh không hợp lệ: ${attendance.trangThai}`,
          });
        }
      }

      const result = await DiemDanhModel.bulkCreateAttendance(attendanceList);

      return res.status(201).json({
        success: true,
        data: result,
        message: "Điểm danh hàng loạt thành công",
      });
    } catch (error) {
      console.error("Lỗi điểm danh hàng loạt:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy thống kê điểm danh (cho giáo vụ và giáo viên chủ nhiệm)
  static async getAttendanceStatistics(req, res) {
    try {
      const { maLop } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin khoảng thời gian",
        });
      }

      let statistics;

      if (req.user.loaiTaiKhoan === "giaovu") {
        // Giáo vụ có quyền xem thống kê tất cả lớp
        statistics = await DiemDanhModel.getAttendanceStatistics(
          maLop,
          startDate,
          endDate
        );
      } else if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Giáo viên chủ nhiệm chỉ xem lớp của mình
        statistics =
          await DiemDanhModel.getAttendanceStatisticsForHomeRoomTeacher(
            maLop,
            startDate,
            endDate,
            req.teacher.maGV
          );
      } else {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }

      return res.status(200).json({
        success: true,
        data: statistics,
        message: "Lấy thống kê điểm danh thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy lịch sử điểm danh của học sinh (giáo vụ và giáo viên chủ nhiệm)
  static async getStudentAttendanceHistory(req, res) {
    try {
      const { maHocSinh } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin khoảng thời gian",
        });
      }

      // Kiểm tra quyền truy cập
      if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Giáo viên chủ nhiệm cần kiểm tra học sinh có thuộc lớp mình không
        const student = await HocSinhModel.getStudentById(maHocSinh);
        if (!student) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy học sinh",
          });
        }

        // Kiểm tra giáo viên có phải chủ nhiệm của lớp chứa học sinh không
        const hasPermission = await GiaoVienModel.isHomeRoomTeacherOfClass(
          req.teacher.maGV,
          student.maLop
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message:
              "Bạn không có quyền xem lịch sử điểm danh của học sinh này",
          });
        }
      } else if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }

      const history = await DiemDanhModel.getStudentAttendanceHistory(
        maHocSinh,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        data: history,
        message: "Lấy lịch sử điểm danh thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy toàn bộ lịch sử điểm danh của lớp (cho giáo vụ và giáo viên chủ nhiệm)
  static async getAttendanceHistoryByClass(req, res) {
    try {
      const { maLop } = req.params;
      // Chỉ giáo vụ hoặc giáo viên chủ nhiệm lớp đó mới được xem
      if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Kiểm tra giáo viên có phải chủ nhiệm lớp này không
        const hasPermission = await GiaoVienModel.isHomeRoomTeacherOfClass(
          req.teacher.maGV,
          maLop
        );
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: "Bạn không có quyền xem lịch sử điểm danh của lớp này",
          });
        }
      } else if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }
      // Lấy toàn bộ lịch sử điểm danh của lớp
      const history = await DiemDanhModel.getAttendanceHistoryByClass(maLop);
      return res.status(200).json({
        success: true,
        data: history,
        message: "Lấy lịch sử điểm danh của lớp thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử điểm danh của lớp:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy toàn bộ điểm danh của một lớp (không cần ngày)
  static async getAllAttendanceByClass(req, res) {
    try {
      const { maLop } = req.params;
      // Chỉ giáo vụ hoặc giáo viên chủ nhiệm lớp đó mới được xem
      if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Kiểm tra giáo viên có phải chủ nhiệm lớp này không
        const hasPermission = await GiaoVienModel.isHomeRoomTeacherOfClass(
          req.teacher.maGV,
          maLop
        );
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: "Bạn không có quyền xem điểm danh của lớp này",
          });
        }
      } else if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }
      const data = await DiemDanhModel.getAllAttendanceByClass(maLop);
      return res.status(200).json({
        success: true,
        data,
        message: "Lấy toàn bộ điểm danh lớp thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy danh sách lớp cho giáo viên chủ nhiệm
  static async getClassesForHomeRoomTeacher(req, res) {
    try {
      if (
        req.user.loaiTaiKhoan !== "gvcn" &&
        req.user.loaiTaiKhoan !== "giaovien"
      ) {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo viên mới có quyền truy cập",
        });
      }

      const classes = await DiemDanhModel.getClassesForHomeRoomTeacher(
        req.teacher.maGV
      );

      return res.status(200).json({
        success: true,
        data: classes,
        message: "Lấy danh sách lớp thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách lớp:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy danh sách tất cả lớp (chỉ giáo vụ)
  static async getAllClasses(req, res) {
    try {
      if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền xem tất cả lớp",
        });
      }

      const classes = await LopModel.getAllClasses();

      return res.status(200).json({
        success: true,
        data: classes,
        message: "Lấy danh sách tất cả lớp thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách lớp:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy danh sách học sinh trong lớp (giáo vụ và giáo viên chủ nhiệm)
  static async getStudentsInClass(req, res) {
    try {
      const { maLop } = req.params;

      // Kiểm tra quyền truy cập
      if (
        req.user.loaiTaiKhoan === "gvcn" ||
        req.user.loaiTaiKhoan === "giaovien"
      ) {
        // Giáo viên chủ nhiệm cần kiểm tra có phải lớp của mình không
        const hasPermission = await GiaoVienModel.isHomeRoomTeacherOfClass(
          req.teacher.maGV,
          maLop
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: "Bạn không có quyền xem danh sách học sinh của lớp này",
          });
        }
      } else if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }

      const students = await HocSinhModel.getStudentsByClass(maLop);

      return res.status(200).json({
        success: true,
        data: students,
        message: "Lấy danh sách học sinh thành công",
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách học sinh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Xóa điểm danh (chỉ giáo vụ)
  static async deleteAttendance(req, res) {
    try {
      const { maDiemDanh } = req.params;

      // Chỉ giáo vụ mới có quyền xóa điểm danh
      if (req.user.loaiTaiKhoan !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền xóa điểm danh",
        });
      }

      const result = await DiemDanhModel.deleteAttendance(maDiemDanh);

      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      console.error("Lỗi xóa điểm danh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Xác nhận điểm danh cho lớp theo ngày
  static async confirmAttendance(req, res) {
    try {
      const { maLop, ngayDiemDanh } = req.body;
      if (!maLop || !ngayDiemDanh) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã lớp hoặc ngày điểm danh",
        });
      }
      // Ở đây chỉ trả về thông báo thành công
      return res.json({
        success: true,
        message: `Đã xác nhận điểm danh cho lớp ${maLop} ngày ${ngayDiemDanh}`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xác nhận điểm danh: " + err.message,
      });
    }
  }
}

module.exports = AttendanceController;
