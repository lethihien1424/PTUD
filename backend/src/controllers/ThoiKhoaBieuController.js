const TKBModel = require("../models/ThoiKhoaBieuModel");

class TKBController {
  // LẬP TKB 
  static async createTKB(req, res) {
    try {
      const { maPhanCong, tietHoc, maLop } = req.body;

      // BẮT BUỘC CÓ ĐỦ 3 TRƯỜNG
      if (!maPhanCong || !tietHoc || !maLop) {
        return res.status(400).json({
          success: false,
          message: "Thiếu maPhanCong, tietHoc hoặc maLop"
        });
      }

      // KIỂM TRA TIẾT HỌC HỢP LỆ
      if (tietHoc < 1 || tietHoc > 12) {
        return res.status(400).json({
          success: false,
          message: "Tiết học phải từ 1 đến 12"
        });
      }

      // GỌI MODEL VỚI ĐỦ 3 THAM SỐ → KIỂM TRA LỚP TRONG bangphancong
      const result = await TKBModel.createTKB(maPhanCong, tietHoc, maLop);

      return res.status(201).json({
        success: true,
        message: "Lập TKB thành công",
        data: result
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // XEM TKB THEO LỚP
  static async getTKB(req, res) {
    try {
      const { maLop } = req.query;
      if (!maLop) {
        return res.status(400).json({
          success: false,
          message: "Thiếu maLop"
        });
      }

      const tkb = await TKBModel.getTKBByLop(maLop);
      return res.json({
        success: true,
        data: tkb
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // XÓA TKB
  static async deleteTKB(req, res) {
    try {
      const { maTKB } = req.params;
      const deleted = await TKBModel.deleteTKB(maTKB);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy TKB"
        });
      }

      return res.json({
        success: true,
        message: "Xóa TKB thành công"
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = TKBController;