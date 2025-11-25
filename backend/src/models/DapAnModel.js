const {pool} = require("../config/db");

class DapAnModel {
  static async getDapAnDung(maBaiTap) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           ch.maCauHoi, 
           dp.maDapAn
         FROM dapan dp
         JOIN cauhoi ch ON dp.maCauHoi = ch.maCauHoi
         WHERE 
           ch.maBaiTap = ? AND dp.isCorrect = 1`,
        [maBaiTap]
      );
      
      return rows; // Ví dụ: [{maCauHoi: 'CH01', maDapAn: 'DA002'}, ...]
    } catch (error) {
      throw new Error("Lỗi khi lấy đáp án chấm điểm: " + error.message);
    }
  }



  static async createDapan(connection, dapanData) {
    // dapanData là 1 object: { maDapAn, maCauHoi, noiDung, isCorrect }
    const { maDapAn, maCauHoi, noiDung, isCorrect } = dapanData;
    
    try {
      const sql = "INSERT INTO dapan (maDapAn, maCauHoi, noiDung, isCorrect) VALUES (?, ?, ?, ?)";
      
      // Vẫn dùng 'query' để đồng nhất
      await connection.query(sql, [maDapAn, maCauHoi, noiDung, isCorrect]); 
    } catch (error) {
      throw new Error("Lỗi khi tạo đáp án (singular): " + error.message);
    }
  }
}

module.exports = DapAnModel;