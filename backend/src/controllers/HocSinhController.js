const StudentModel = require("../models/HocSinhModel");

class StudentController {
  // Lấy danh sách học sinh theo lớp
  static async getStudentsForAttendance(req, res) {
    try {
      const { maLop } = req.params;
      const students = await StudentModel.getStudentsForAttendance(maLop);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //Lấy thông tin chi tiết học sinh
  static async getStudentById(req, res) {
    try {
      let maHocSinh = null;

      if (req.params.id && req.params.id !== "undefined") {
        maHocSinh = req.params.id.trim();
      }
      else if (req.query.maHocSinh) {
        maHocSinh = req.query.maHocSinh.trim();
      }

      if (!maHocSinh || maHocSinh === "" || maHocSinh === "undefined") {
        return res.status(400).json({
          success: false,
          message: "Thiếu hoặc sai mã học sinh (id không hợp lệ)"
        });
      }

      console.log("Backend nhận được mã học sinh →", maHocSinh);

      const student = await StudentModel.getStudentById(maHocSinh);  // ĐÃ SỬA

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh hoặc học sinh đã nghỉ học"
        });
      }

      return res.json({
        success: true,
        data: student
      });

    } catch (error) {
      console.error("Lỗi getStudentById:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
        error: error.message
      });
    }
  }

  //Tìm kiếm học sinh
  static async searchStudents(req, res) {
    try {
      const { keyword = "", maHocSinh } = req.query;
      const students = await StudentModel.searchStudents(keyword, maHocSinh);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //Tạo mới học sinh
  static async createStudent(req, res) {
    try {
      const result = await StudentModel.createStudent(req.body);  // ĐÃ SỬA
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //Cập nhật thông tin học sinh
  static async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const result = await StudentModel.updateStudent(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  //Chuyển lớp học sinh
  static async transferStudent(req, res) {
    try {
      const { id } = req.params;
      const { maLopMoi, namHoc } = req.body;

      if (!maLopMoi || maLopMoi.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Mã lớp mới không hợp lệ"
        });
      }

      const result = await StudentModel._transferStudent(id, maLopMoi.trim(), namHoc);  // ĐÃ SỬA
      return res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
      console.error("Lỗi chuyển lớp:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  //Lấy hồ sơ học sinh
  static async getStudentProfile(req, res) {
    try {
      const { maHocSinh } = req.params;

      // 1. Kiểm tra đăng nhập (từ middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Chưa đăng nhập",
        });
      }

      // 2. Kiểm tra quyền (Chỉ GV hoặc GVCN)
      // (Dựa trên auth.js, 'loaiTaiKhoan' là 'giaovien' hoặc 'gvcn')
      if (
        req.user.loaiTaiKhoan !== "giaovien" &&
        req.user.loaiTaiKhoan !== "gvcn"
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem hồ sơ này.",
        });
      }

      // 3. Kiểm tra đầu vào
      if (!maHocSinh) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp mã học sinh",
        });
      }

      // 4. Gọi Model
      const student = await StudentModel.getProfile(maHocSinh);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh",
        });
      }

      return res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin học sinh",
        error: error.message,
      });
    }
  }
  static async softDeleteStudent(req, res) {
    try {
      const { id } = req.params;
      if (!id || id.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Mã học sinh không hợp lệ",
        });
      }

      const result = await StudentModel.softDeleteStudent(id.trim());  // ĐÃ SỬA
      return res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
      console.error("Lỗi khi xóa mềm học sinh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa học sinh",
        error: error.message,
      });
    }
  }
  static async restoreStudent(req, res) {
    try {
      const { id } = req.params;
      if (!id || id.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Mã học sinh không hợp lệ",
        });
      }

      const result = await StudentModel.restoreStudent(id.trim());  // ĐÃ SỬA
      return res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
      console.error("Lỗi khi khôi phục học sinh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi khôi phục học sinh",
        error: error.message,
      });
    }
  }
}

module.exports = StudentController;
