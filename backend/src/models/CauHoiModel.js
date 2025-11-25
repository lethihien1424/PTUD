const {pool} = require("../config/db");

class CauHoiModel {
  static async getCauHoiTracNghiem(maBaiTap) {
    try {
      // 1. Lấy danh sách câu hỏi
      const [questions] = await pool.execute(
        `SELECT maCauHoi, noiDung 
         FROM cauhoi 
         WHERE maBaiTap = ?`,
        [maBaiTap]
      );

      if (questions.length === 0) {
        return [];
      }

      // 2. Lấy tất cả các lựa chọn (đáp án) cho các câu hỏi đó
      const questionIds = questions.map((q) => q.maCauHoi);
      
      // Lấy các lựa chọn, KHÔNG lấy 'isCorrect'
      const [options] = await pool.query(
        `SELECT maDapAn, maCauHoi, noiDung 
         FROM dapan 
         WHERE maCauHoi IN (?)`, // IN (?) sẽ tự động xử lý mảng
        [questionIds]
      );

      // 3. Gộp câu hỏi và lựa chọn lại (dùng JavaScript)
      const questionMap = new Map();
      questions.forEach(q => {
        questionMap.set(q.maCauHoi, {
          maCauHoi: q.maCauHoi,
          noiDung: q.noiDung,
          luaChon: [] // Mảng để chứa các lựa chọn
        });
      });

      options.forEach(opt => {
        if (questionMap.has(opt.maCauHoi)) {
          questionMap.get(opt.maCauHoi).luaChon.push({
            maDapAn: opt.maDapAn,
            noiDung: opt.noiDung
          });
        }
      });

      // Trả về một mảng các câu hỏi
      return Array.from(questionMap.values());

    } catch (error) {
      throw new Error("Lỗi khi lấy câu hỏi trắc nghiệm: " + error.message);
    }
  }

  static async createCauHoi(connection, cauHoiData) {
    const { maCauHoi, maBaiTap, noiDung } = cauHoiData;
    try {
      const sql = `INSERT INTO cauhoi (maCauHoi, maBaiTap, noiDung) VALUES (?, ?, ?)`;
      
      // Đảm bảo đây là 'connection.query'
      await connection.query(sql, [maCauHoi, maBaiTap, noiDung]);

    } catch (error) {
      throw new Error("Lỗi khi tạo câu hỏi: " + error.message);
    }
  }
}

module.exports = CauHoiModel;