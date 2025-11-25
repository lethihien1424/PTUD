const PhieuDanhGiaHanhKiemModel = require("../models/PhieuDanhGiaHanhKiemModel");

// Thứ tự hạnh kiểm dùng để so sánh
const HANH_KIEM_ORDER = ["Giỏi", "Khá", "Trung bình", "Yếu", "Kém"];
const NHAN_XET_TU_DONG = {
  "Giỏi": "tốt",
  "Khá": "khá",
  "Trung bình": "trung bình",
  "Yếu": "yếu",
  "Kém": "kém",
};

function tinhHanhKiemTheoHocLuc(diemTK) {
  if (diemTK >= 8) return "Giỏi";
  if (diemTK >= 6.5) return "Khá";
  if (diemTK >= 5) return "Trung bình";
  if (diemTK > 0) return "Yếu";
  return "Kém";
}

function haBacHanhKiem(loai) {
  const index = HANH_KIEM_ORDER.indexOf(loai);
  if (index === -1 || index === HANH_KIEM_ORDER.length - 1) {
    return "Kém";
  }
  return HANH_KIEM_ORDER[index + 1];
}

function tinhHanhKiemTuDong(diemTK, soBuoiVang) {
  const base = tinhHanhKiemTheoHocLuc(diemTK || 0);
  if (soBuoiVang > 15) {
    if (base === "Kém") return "Kém";
    return haBacHanhKiem(base);
  }
  return base;
}

function isLowerThanAuto(submitted, auto) {
  const subIdx = HANH_KIEM_ORDER.indexOf(submitted);
  const autoIdx = HANH_KIEM_ORDER.indexOf(auto);
  if (subIdx === -1 || autoIdx === -1) return false;
  return subIdx > autoIdx;
}

class DanhGiaHanhKiemController {
  // GET /api/hanhkiem/lop/:maLop?hocKy=...
  static async getDanhSachTheoLop(req, res) {
    try {
      if (!req.user || !["giaovien", "gvcn"].includes(req.user.loaiTaiKhoan)) {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo viên mới được truy cập",
        });
      }

      const { maLop } = req.params;
      const { hocKy } = req.query;

      if (!maLop || !hocKy) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã lớp hoặc học kỳ",
        });
      }

      const maGV = req.user.maGiaoVien;
      if (!maGV) {
        return res.status(403).json({
          success: false,
          message: "Không tìm thấy thông tin giáo viên",
        });
      }

      const allowed = await PhieuDanhGiaHanhKiemModel.isTeacherAssignedToClass(
        maGV,
        maLop
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Bạn không được phân công lớp này",
        });
      }

      const students = await PhieuDanhGiaHanhKiemModel.getStudentsWithScore(
        maLop,
        hocKy
      );
      const absenceRows = await PhieuDanhGiaHanhKiemModel.getAbsenceByClass(
        maLop,
        hocKy
      );

      const absenceMap = {};
      absenceRows.forEach((row) => {
        absenceMap[row.maHocSinh] = row.soBuoiVang;
      });

      const data = students.map((student) => {
        const diemTK = Number(student.diemTK || 0);
        const soBuoiVang = absenceMap[student.maHocSinh] || 0;
        const loaiHanhKiem = tinhHanhKiemTuDong(diemTK, soBuoiVang);

        return {
          maHocSinh: student.maHocSinh,
          hoTen: student.hoTen,
          maLop: student.maLop,
          diemTK,
          soBuoiVang,
          loaiHanhKiemDeXuat: loaiHanhKiem,
        };
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách hạnh kiểm:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách hạnh kiểm",
      });
    }
  }

  // POST /api/hanhkiem
  static async luuDanhGia(req, res) {
    try {
      if (!req.user || !["giaovien", "gvcn"].includes(req.user.loaiTaiKhoan)) {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo viên mới được đánh giá",
        });
      }

      const { maHocSinh, loaiHanhKiem, nhanXet, maHocKy, confirmThapHon } =
        req.body || {};

      if (!maHocSinh || !maHocKy) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin học sinh hoặc học kỳ",
        });
      }

      if (!loaiHanhKiem) {
        return res.status(400).json({
          success: false,
          message: "Không được bỏ trống loại hạnh kiểm",
        });
      }

      const student = await PhieuDanhGiaHanhKiemModel.getStudentInfo(maHocSinh);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh",
        });
      }

      const maGV = req.user.maGiaoVien;
      if (!maGV) {
        return res.status(403).json({
          success: false,
          message: "Không tìm thấy thông tin giáo viên",
        });
      }

      const allowed = await PhieuDanhGiaHanhKiemModel.isTeacherAssignedToClass(
        maGV,
        student.maLop
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Bạn không được phân công lớp của học sinh này",
        });
      }

      const diemTK =
        await PhieuDanhGiaHanhKiemModel.getAverageScoreForStudent(
          maHocSinh,
          maHocKy
        );
      const soBuoiVang =
        await PhieuDanhGiaHanhKiemModel.getAbsenceForStudent(
          maHocSinh,
          student.maLop,
          maHocKy
        );
      const loaiTuDong = tinhHanhKiemTuDong(diemTK, soBuoiVang);

      if (!confirmThapHon && isLowerThanAuto(loaiHanhKiem, loaiTuDong)) {
        return res.status(200).json({
          success: false,
          warning: true,
          autoLoaiHanhKiem: loaiTuDong,
          message:
            "Bạn đang xếp loại hạnh kiểm thấp hơn mức đề xuất tự động. Bạn có chắc chắn không",
        });
      }

      const maPhieuHK = `PHK${Date.now()}`;
      const finalNhanXet =
        nhanXet || NHAN_XET_TU_DONG[loaiHanhKiem] || "trung bình";

      await PhieuDanhGiaHanhKiemModel.saveEvaluation({
        maPhieuHK,
        maHocSinh,
        maGiaoVien: maGV,
        loaiHanhKiem,
        nhanXet: finalNhanXet,
        maHocKy,
      });

      return res.status(201).json({
        success: true,
        message: "Đánh giá hạnh kiểm thành công",
        data: {
          maPhieuHK,
          maHocSinh,
          maGiaoVien: maGV,
          loaiHanhKiem,
          nhanXet: finalNhanXet,
          maHocKy,
          diemTK,
          soBuoiVang,
          loaiHanhKiemTuDong: loaiTuDong,
        },
      });
    } catch (error) {
      console.error("Lỗi lưu đánh giá hạnh kiểm:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lưu đánh giá hạnh kiểm",
      });
    }
  }

  // GET /api/hanhkiem/hocsinh/:maHocSinh
  static async getDanhGiaHocSinh(req, res) {
    try {
      const { maHocSinh } = req.params;
      if (!maHocSinh) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã học sinh",
        });
      }

      const records =
        await PhieuDanhGiaHanhKiemModel.getEvaluationsByStudent(maHocSinh);
      return res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      console.error("Lỗi lấy phiếu hạnh kiểm:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy phiếu hạnh kiểm",
      });
    }
  }
}

module.exports = DanhGiaHanhKiemController;

