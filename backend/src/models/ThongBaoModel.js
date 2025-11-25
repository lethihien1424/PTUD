const { pool } = require("../config/db");

class ThongBaoModel {
  // Lấy danh sách thông báo (kèm trạng thái đã đọc/chưa đọc của user đang đăng nhập)
  static async getAll(maTaiKhoan, targetAudience = null) {
    try {
      // Logic: Lấy thông báo, LEFT JOIN với bảng lk_thongbao để xem trạng thái của user này
      let sql = `
        SELECT 
          tb.maThongBao,
          tb.tieuDe,
          tb.noiDung,
          tb.ngayDang,
          tb.loaiThongBao,
          COALESCE(lk.trangThai, 'Chưa đọc') AS trangThai
        FROM bangthongbao tb
        LEFT JOIN tk_thongbao lk 
          ON tb.maThongBao = lk.maThongBao AND lk.maTaiKhoan = ?
      `;

      const params = [maTaiKhoan];

      // Nếu có lọc theo đối tượng (VD: chỉ lấy thông báo cho Học sinh hoặc Toàn trường)
      // Giả sử loaiThongBao: 1=Toàn trường, 2=Giáo viên, 3=Học sinh/Phụ huynh
      if (targetAudience) {
        sql += ` WHERE tb.loaiThongBao IN (?, 1)`; // Lấy loại cụ thể + loại toàn trường
        params.push(targetAudience);
      }

      sql += ` ORDER BY tb.ngayDang DESC`;

      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết thông báo
  static async getById(maThongBao) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM bangthongbao WHERE maThongBao = ?`,
        [maThongBao]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Đánh dấu đã đọc (Upsert: Nếu chưa có thì Insert, có rồi thì Update)
  static async markAsRead(maTaiKhoan, maThongBao) {
    try {
      // Sử dụng INSERT ... ON DUPLICATE KEY UPDATE để tối ưu
      await pool.execute(
        `INSERT INTO tk_thongbao (maTaiKhoan, maThongBao, trangThai) 
         VALUES (?, ?, 'Đã đọc')
         ON DUPLICATE KEY UPDATE trangThai = 'Đã đọc'`,
        [maTaiKhoan, maThongBao]
      );
    } catch (error) {
      throw error;
    }
  }

  // Tạo thông báo mới (Chức năng gửi)
  static async create({ tieuDe, noiDung, loaiThongBao }) {
    try {
      const maThongBao = `TB${Date.now()}`; // Tạo mã tự động
      const ngayDang = new Date();

      await pool.execute(
        `INSERT INTO bangthongbao (maThongBao, tieuDe, noiDung, ngayDang, loaiThongBao) 
         VALUES (?, ?, ?, ?, ?)`,
        [maThongBao, tieuDe, noiDung, ngayDang, loaiThongBao]
      );
      return maThongBao;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ThongBaoModel;