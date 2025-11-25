const { pool } = require("../config/db");

class HocKyModel {
  static async getAllHocKy() {
    try {
      const [rows] = await pool.execute(
        `SELECT maHocKy, tenHocKy, namHoc
         FROM hocky
         ORDER BY namHoc DESC, maHocKy`
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách học kỳ: " + error.message);
    }
  }

  static async getHocKyById(maHocKy) {
    try {
      const [rows] = await pool.execute(
        `SELECT maHocKy, tenHocKy, namHoc
         FROM hocky
         WHERE maHocKy = ?
         LIMIT 1`,
        [maHocKy]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin học kỳ: " + error.message);
    }
  }

  static async getActiveHocKy() {
    // Hiện tại chưa có cờ khóa, trả toàn bộ học kỳ
    return this.getAllHocKy();
  }
}

module.exports = HocKyModel;

