const DiemModel = require("../models/DiemModel");
const TeacherModel = require("../models/GiaoVienModel"); 
const HocKyModel = require("../models/HocKyModel");

const calculateDiemTongKet = ({
  diemMieng,
  diem15phut,
  diem1Tiet,
  diemGiuaKy,
  diemCuoiKy,
}) => {
  const weightedTotal =
    diemMieng + diem15phut + diem1Tiet + 2 * diemGiuaKy + 3 * diemCuoiKy;
  const average = weightedTotal / 8;
  return Number(average.toFixed(2));
};

const parseScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

class DiemController {
  static async createOrUpdateGrade(req, res) {
    try {
      // 1. Kiểm tra quyền
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Chưa đăng nhập",
        });
      }
      if (
        req.user.loaiTaiKhoan !== "giaovien" &&
        req.user.loaiTaiKhoan !== "gvcn"
      ) {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo viên mới được nhập điểm",
        });
      }

      // 2. Lấy thông tin giáo viên
      const teacher = await TeacherModel.getTeacherByAccountId(
        req.user.maTaiKhoan
      );
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin giáo viên",
        });
      }

      // 3. Lấy dữ liệu điểm
      const {
        maHocSinh,
        maLop,
        maMonHoc,
        maHocKy,
        diemMieng,
        diem15phut,
        diem1Tiet,
        diemGiuaKy,
        diemCuoiKy,
      } = req.body || {};

      // 4. Validate dữ liệu
      if (!maHocSinh || !maLop || !maMonHoc || !maHocKy) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin học sinh, lớp, môn học hoặc học kỳ.",
        });
      }

      // 5.1 Kiểm tra học kỳ tồn tại
      const semester = await HocKyModel.getHocKyById(maHocKy);
      if (!semester) {
        return res.status(400).json({
          success: false,
          message: "Học kỳ không tồn tại.",
        });
      }

      // 5. Xác thực quyền (GV có dạy lớp đó và môn đó không?)
      const assignment = await DiemModel.findAssignment(
        teacher.maGV,
        maLop,
        maMonHoc
      );
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "Bạn không được phân công dạy môn này cho lớp này.",
        });
      }

      // 6. Xác thực học sinh (HS có thuộc lớp đó không?)
      const student = await DiemModel.studentBelongsToClass(maHocSinh, maLop);
      if (!student) {
        return res.status(400).json({
          success: false,
          message: "Học sinh không thuộc lớp học này.",
        });
      }

      // 7. Chuẩn hóa & tính điểm tổng kết
      const scoreMap = {
        diemMieng: parseScore(diemMieng),
        diem15phut: parseScore(diem15phut),
        diem1Tiet: parseScore(diem1Tiet),
        diemGiuaKy: parseScore(diemGiuaKy),
        diemCuoiKy: parseScore(diemCuoiKy),
      };

      const invalidScore = Object.entries(scoreMap).find(
        ([, value]) => value === null
      );
      if (invalidScore) {
        return res.status(400).json({
          success: false,
          message: `Giá trị ${invalidScore[0]} không hợp lệ`,
        });
      }

      const diemTK = calculateDiemTongKet(scoreMap);

      // 8. Gửi dữ liệu tới Model
      const result = await DiemModel.createOrUpdateGrade({
        maHocSinh,
        maMonHoc,
        maHocKy,
        diemMieng: scoreMap.diemMieng,
        diem15phut: scoreMap.diem15phut,
        diem1Tiet: scoreMap.diem1Tiet,
        diemGiuaKy: scoreMap.diemGiuaKy,
        diemCuoiKy: scoreMap.diemCuoiKy,
        diemTK,
      });

      res.status(200).json({
        success: true,
        message: result.updated ? "Cập nhật điểm thành công" : "Nhập điểm thành công",
        maDiem: result.maDiem,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi nhập điểm: " + error.message,
      });
    }
  }

  // Thêm 'static async'
  static async getClassGrades(req, res) {
    try {
      // 1. Kiểm tra quyền
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Chưa đăng nhập",
        });
      }
      if (
        req.user.loaiTaiKhoan !== "giaovien" &&
        req.user.loaiTaiKhoan !== "gvcn"
      ) {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo viên mới được xem bảng điểm",
        });
      }

      // 2. Lấy thông tin giáo viên
      const teacher = await TeacherModel.getTeacherByAccountId(
        req.user.maTaiKhoan
      );
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin giáo viên",
        });
      }

      // 3. Lấy maLop
      const { maLop } = req.params;
      const { maHocKy } = req.query;
      if (!maLop) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã lớp",
        });
      }

      if (maHocKy) {
        const semester = await HocKyModel.getHocKyById(maHocKy);
        if (!semester) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy học kỳ",
          });
        }
      }

      // 4. Xác thực (GV có dạy lớp đó không?)
      const hasClass = await DiemModel.teacherHasClass(teacher.maGV, maLop);
      if (!hasClass) {
        return res.status(403).json({
          success: false,
          message: "Bạn không được phân công cho lớp này",
        });
      }

      // 5. Gọi Model
      const grades = await DiemModel.getGradesByClass(maLop, maHocKy || null);
      
      res.status(200).json({
        success: true,
        data: grades,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy bảng điểm: " + error.message,
      });
    }
  }
}

module.exports = DiemController;