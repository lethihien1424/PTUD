const {pool} = require("../config/db");
const { v4: uuidv4 } = require('uuid'); 

class BaiLamModel {
  static async nopBaiTracNghiem(
    connection,
    maHocSinh,
    maBaiTap,
    diem,
    chiTietAnswers
  ) {
    // 1. TẠO ID THỦ CÔNG (Ví dụ: dùng UUID hoặc một chuỗi ngẫu nhiên)
    const maBaiLam = uuidv4().substring(0, 10); // Tạo 1 ID 10 ký tự
    // Hoặc cách đơn giản: const maBaiLam = `BL-${Date.now()}`; 

    // 2. Insert vào bảng 'bailam' (sử dụng ID vừa tạo)
    await connection.execute(
      `INSERT INTO bailam 
         (maBaiLam, maHocSinh, maBaiTap, ngayNop, diem, trangThai) 
       VALUES 
         (?, ?, ?, NOW(), ?, 'Đã nộp')`,
      [maBaiLam, maHocSinh, maBaiTap, diem] // <-- Đã thêm 'maBaiLam'
    );

    // 3. Chuẩn bị các promise để insert vào 'cautraloi'
    const chiTietPromises = chiTietAnswers.map((answer) => { 
      return connection.execute(
        `INSERT INTO cautraloi (maBaiLam, maCauHoi, maDapAn) VALUES (?, ?, ?)`,
        [maBaiLam, answer.maCauHoi, answer.maDapAn] 
      );
    });

    // 4. Thực thi tất cả promise
    await Promise.all(chiTietPromises);

    return maBaiLam; 
  }
}

module.exports = BaiLamModel;