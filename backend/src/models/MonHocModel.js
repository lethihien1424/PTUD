const { pool } = require("../config/db"); 

class MonHocModel {
  static async getMonHocByLop(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT 
           mh.maMonHoc, 
           mh.tenMonHoc
         FROM bangphancong pc
         JOIN monhoc mh ON pc.maMonHoc = mh.maMonHoc
         WHERE pc.maLop = ?`,
        [maLop]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách môn học: " + error.message);
    }
  }
}

module.exports = MonHocModel;