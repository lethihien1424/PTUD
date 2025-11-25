const ThongBaoModel = require("../models/ThongBaoModel");

class ThongBaoController {
  // GET /api/thongbao
  static async getDanhSach(req, res) {
    try {
      const maTaiKhoan = req.user.maTaiKhoan;
      const loaiTaiKhoan = req.user.loaiTaiKhoan;

      // Mapping loại tài khoản sang loaiThongBao trong DB
      // Quy ước ví dụ: 2=Giáo viên, 3=Học sinh. (Cần khớp với logic nhập liệu của bạn)
      let targetAudience = null;
      if (loaiTaiKhoan === 'hocsinh' || loaiTaiKhoan === 'phuhuynh') targetAudience = 3;
      if (loaiTaiKhoan === 'giaovien' || loaiTaiKhoan === 'gvcn') targetAudience = 2;

      const data = await ThongBaoModel.getAll(maTaiKhoan, targetAudience);

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }

  // GET /api/thongbao/:id
  static async getChiTiet(req, res) {
    try {
      const { id } = req.params;
      const maTaiKhoan = req.user.maTaiKhoan;

      const thongBao = await ThongBaoModel.getById(id);
      
      if (!thongBao) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông báo",
        });
      }

      // Theo Use Case: Khi xem chi tiết -> Cập nhật trạng thái thành "Đã đọc"
      await ThongBaoModel.markAsRead(maTaiKhoan, id);

      return res.status(200).json({
        success: true,
        data: thongBao,
      });
    } catch (error) {
      console.error("Lỗi xem chi tiết thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }

  // POST /api/thongbao (Gửi thông báo)
  static async taoThongBao(req, res) {
    try {
      // Chỉ cho phép admin/giáo vụ/BGH
      if (!['admin', 'giaovu', 'bangiamhieu'].includes(req.user.loaiTaiKhoan)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền gửi thông báo",
        });
      }

      const { tieuDe, noiDung, loaiThongBao } = req.body;

      if (!tieuDe || !noiDung || !loaiThongBao) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đủ thông tin",
        });
      }

      const newId = await ThongBaoModel.create({ tieuDe, noiDung, loaiThongBao });

      return res.status(201).json({
        success: true,
        message: "Tạo thông báo thành công",
        maThongBao: newId
      });

    } catch (error) {
      console.error("Lỗi tạo thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }
}

module.exports = ThongBaoController;