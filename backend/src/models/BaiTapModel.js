const {pool} = require("../config/db");

class BaiTapModel {
  static async getBaiTapByMonHoc(maLop, maMonHoc, maHocSinh) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           bt.*,
           bl.trangThai AS trangThaiNopBai,
           bl.diem
         FROM baitap bt
         LEFT JOIN bailam bl ON bt.maBaiTap = bl.maBaiTap AND bl.maHocSinh = ?
         WHERE 
           bt.maLop = ? AND bt.maMon = ?
         GROUP BY 
           bt.maBaiTap
         ORDER BY 
           bt.hanNop DESC`,
        [maHocSinh, maLop, maMonHoc]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách bài tập: " + error.message);
    }
  }

  static async getBaiTapById(maBaiTap) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM baitap WHERE maBaiTap = ?`,
        [maBaiTap]
      );
      return rows[0]; // Trả về 1 object hoặc undefined
    } catch (error) {
      throw new Error("Lỗi khi lấy chi tiết bài tập: " + error.message);
    }
  }


  static async createBaiTapTuLuan(baiTapData) {
    const { maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop, fileHuongDan } = baiTapData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO baitap 
           (maBaiTap, maLop, maMon, tieuDe, moTa, hanNop, loaiBai, ngayTao, fileHuongDan) 
         VALUES 
           (?, ?, ?, ?, ?, ?, 'Tự luận', NOW(), ?)`,
        [maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop, fileHuongDan]
      );
      return result;
    } catch (error) {
      throw new Error("Lỗi khi tạo bài tập tự luận: " + error.message);
    }
  }

  static async createBaiTapTracNghiem(connection, baiTapData) {
    const { maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop } = baiTapData;

    try {
      const sql = `INSERT INTO baitap 
                     (maBaiTap, maLop, maMon, tieuDe, moTa, hanNop, loaiBai, ngayTao) 
                   VALUES 
                     (?, ?, ?, ?, ?, ?, 'Trắc nghiệm', NOW())`;
      
      // Đảm bảo đây là 'connection.query'
      await connection.query(sql, [maBaiTap, maLop, maMonHoc, tieuDe, moTa, hanNop]);

    } catch (error) {
      throw new Error("Lỗi khi tạo bài tập trắc nghiệm: " + error.message);
    }
  }
}

module.exports = BaiTapModel;