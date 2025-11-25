const HocKyModel = require("../models/HocKyModel");
const BangPhanCongModel = require("../models/PhanCongModel");
const DiemModel = require("../models/DiemModel");
const PhieuSuaDiemModel = require("../models/PhieuSuaDiemModel");

const isValidScore = (value) => {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return num > 0 && num < 10;
};

class SuaDiemController {
  // GET /api/suadiem/hocky
  static async getDanhSachHocKy(req, res) {
    try {
      const hocKy = await HocKyModel.getActiveHocKy();
      return res.status(200).json({ success: true, data: hocKy });
    } catch (error) {
      console.error("Lỗi lấy học kỳ:", error);
      return res
        .status(500)
        .json({ success: false, message: "Không lấy được danh sách học kỳ" });
    }
  }

  // GET /api/suadiem/mon?hocKy=...
  static async getDanhSachMonTheoHocKy(req, res) {
    try {
      if (!req.user || !["giaovien", "gvcn"].includes(req.user.loaiTaiKhoan)) {
        return res
          .status(403)
          .json({ success: false, message: "Chỉ giáo viên mới được truy cập" });
      }

      const { hocKy } = req.query;
      const maGV = req.user.maGiaoVien;
      if (!maGV) {
        return res
          .status(403)
          .json({ success: false, message: "Không tìm thấy thông tin giáo viên" });
      }

      const assignments = await BangPhanCongModel.getAssignmentsByTeacher(
        maGV,
        hocKy
      );
      return res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      console.error("Lỗi lấy danh sách môn:", error);
      return res
        .status(500)
        .json({ success: false, message: "Không lấy được danh sách môn học" });
    }
  }

  // GET /api/suadiem/lop/:maLop/mon/:maMonHoc?hocKy=...
  static async getDanhSachDiemTheoLopMonHocKy(req, res) {
    try {
      if (!req.user || !["giaovien", "gvcn"].includes(req.user.loaiTaiKhoan)) {
        return res
          .status(403)
          .json({ success: false, message: "Chỉ giáo viên mới được truy cập" });
      }

      const { maLop, maMonHoc } = req.params;
      const { hocKy } = req.query;
      if (!maLop || !maMonHoc || !hocKy) {
        return res.status(400).json({
          success: false,
          message: "Thiếu dữ liệu lớp, môn hoặc học kỳ",
        });
      }

      const maGV = req.user.maGiaoVien;
      const allowed = await BangPhanCongModel.isTeacherAssigned(
        maGV,
        maLop,
        maMonHoc
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem điểm lớp/môn này",
        });
      }

      const data = await DiemModel.getScoresOfClass(maLop, maMonHoc, hocKy);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Lỗi lấy danh sách điểm:", error);
      return res
        .status(500)
        .json({ success: false, message: "Không lấy được danh sách điểm" });
    }
  }

  // GET /api/suadiem/diem/:maDiem
  static async getChiTietDiem(req, res) {
    try {
      const { maDiem } = req.params;
      if (!maDiem) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu mã điểm" });
      }

      const detail = await DiemModel.getScoreDetail(maDiem);
      if (!detail) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bản ghi điểm" });
      }

      return res.status(200).json({ success: true, data: detail });
    } catch (error) {
      console.error("Lỗi lấy chi tiết điểm:", error);
      return res
        .status(500)
        .json({ success: false, message: "Không lấy được chi tiết điểm" });
    }
  }

  // POST /api/suadiem
  static async guiYeuCauSuaDiem(req, res) {
    try {
      if (!req.user || !["giaovien", "gvcn"].includes(req.user.loaiTaiKhoan)) {
        return res
          .status(403)
          .json({ success: false, message: "Chỉ giáo viên mới được gửi yêu cầu" });
      }

      const { maDiem, loaiDiem, diemDeNghi, lyDo, minhChung, maHocKy } =
        req.body || {};

      if (!maDiem || !loaiDiem || !diemDeNghi || !lyDo || !minhChung || !maHocKy) {
        return res.status(400).json({
          success: false,
          message: "Không được để trống trường dữ liệu",
        });
      }

      if (!isValidScore(diemDeNghi)) {
        return res.status(400).json({
          success: false,
          message: "Điểm đề nghị phải là số > 0 và < 10",
        });
      }

      const column = DiemModel.getColumnByScoreType(loaiDiem);
      if (!column) {
        return res
          .status(400)
          .json({ success: false, message: "Loại điểm không hợp lệ" });
      }

      const diem = await DiemModel.getScoreDetail(maDiem);
      if (!diem) {
        return res
          .status(404)
          .json({ success: false, message: "Bản ghi điểm không tồn tại" });
      }

      const maGV = req.user.maGiaoVien;
      if (!maGV) {
        return res
          .status(403)
          .json({ success: false, message: "Không tìm thấy thông tin giáo viên" });
      }

      const allowed = await BangPhanCongModel.isTeacherAssigned(
        maGV,
        diem.maLop,
        diem.maMonHoc
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền sửa điểm này",
        });
      }

      const hocKy = await HocKyModel.getHocKyById(maHocKy);
      if (!hocKy) {
        return res
          .status(400)
          .json({ success: false, message: "Học kỳ không tồn tại" });
      }
      if (hocKy.trangThai === "khoa") {
        return res.status(400).json({
          success: false,
          message: "Học kỳ đã khóa điểm, không thể gửi yêu cầu",
        });
      }

      const hasPending = await PhieuSuaDiemModel.hasPendingRequest(
        maDiem,
        loaiDiem,
        maHocKy
      );
      if (hasPending) {
        return res.status(400).json({
          success: false,
          message: "Đã có phiếu sửa điểm chờ duyệt cho bản ghi này",
        });
      }

      const diemCu = diem[column];
      const maPhieu = `PSD${Date.now()}`;

      await PhieuSuaDiemModel.createRequest({
        maPhieu,
        diemCu,
        diemDeNghi,
        loaiDiem,
        lyDo,
        minhChung,
        maGV,
        maDiem,
        maHocKy,
      });

      return res.status(201).json({
        success: true,
        message: "Gửi yêu cầu sửa điểm thành công",
        data: {
          maPhieu,
          maDiem,
          loaiDiem,
          diemCu,
          diemDeNghi,
          lyDo,
          minhChung,
          maGV,
          maHocKy,
          trangThai: "Chờ duyệt",
        },
      });
    } catch (error) {
      console.error("Lỗi gửi yêu cầu sửa điểm:", error);
      return res
        .status(500)
        .json({ success: false, message: "Không thể gửi yêu cầu sửa điểm" });
    }
  }
}

module.exports = SuaDiemController;

