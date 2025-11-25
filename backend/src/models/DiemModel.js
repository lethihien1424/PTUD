const { pool } = require("../config/db");

class DiemModel {
  static async findAssignment(maGV, maLop, maMonHoc) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM bangphancong WHERE maGV = ? AND maLop = ? AND maMonHoc = ?",
        [maGV, maLop, maMonHoc]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi tìm phân công: " + error.message);
    }
  }

  static async teacherHasClass(maGV, maLop) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM bangphancong WHERE maGV = ? AND maLop = ? LIMIT 1",
        [maGV, maLop]
      );
      return rows && rows.length > 0;
    } catch (error) {
      throw new Error("Lỗi khi kiểm tra GV-Lớp: " + error.message);
    }
  }

  static async studentBelongsToClass(maHocSinh, maLop) {
    try {
      const [rows] = await pool.execute(
        "SELECT maHocSinh FROM hocsinh WHERE maHocSinh = ? AND maLop = ?",
        [maHocSinh, maLop]
      );
      return rows && rows.length > 0;
    } catch (error) {
      throw new Error("Lỗi khi kiểm tra HS-Lớp: " + error.message);
    }
  }

  static async findGrade(maHocSinh, maMonHoc) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM diem WHERE maHocSinh = ? AND maMonHoc = ?",
        [maHocSinh, maMonHoc]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi tìm điểm: " + error.message);
    }
  }

  static async createOrUpdateGrade(gradeData) {
    const {
      maHocSinh,
      maMonHoc,
      diemMieng,
      diem15phut,
      diem1Tiet,
      diemGiuaKy,
      diemCuoiKy,
      diemTK,
    } = gradeData;

    try {
      const existing = await this.findGrade(maHocSinh, maMonHoc);

      if (existing) {
        // --- CẬP NHẬT ĐIỂM ---
        await pool.execute(
          `UPDATE diem SET 
            diemMieng = ?, 
            diem15p = ?, 
            diem1tiet = ?, 
            diemGK = ?, 
            diemCK = ?, 
            diemTK = ? 
            WHERE maDiem = ?`,
          [
            diemMieng,
            diem15phut,
            diem1Tiet,
            diemGiuaKy,
            diemCuoiKy,
            diemTK,
            existing.maDiem,
          ]
        );
        return { updated: true, maDiem: existing.maDiem };
      } else {
        // --- TẠO ĐIỂM MỚI ---
        const num = Math.floor(Math.random() * 1000000);
        const newId = `DI${num.toString().padStart(7, "0")}`; // Ví dụ: DI0123456

        await pool.execute(
          `INSERT INTO diem (maDiem, maHocSinh, maMonHoc, diemMieng, diem15p, diem1tiet, diemGK, diemCK, diemTK)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId,
            maHocSinh,
            maMonHoc,
            diemMieng,
            diem15phut,
            diem1Tiet,
            diemGiuaKy,
            diemCuoiKy,
            diemTK,
          ]
        );
        return { updated: false, maDiem: newId };
      }
    } catch (error) {
      throw new Error("Lỗi khi tạo/cập nhật điểm: " + error.message);
    }
  }

  static async getGradesByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
            hs.maHocSinh, 
            hs.hoTen, 
            d.maMonHoc, 
            mh.tenMonHoc, 
            d.diemMieng, 
            d.diem15p, 
            d.diem1tiet, 
            d.diemGK, 
            d.diemCK, 
            d.diemTK 
         FROM hocsinh hs
         LEFT JOIN diem d ON hs.maHocSinh = d.maHocSinh
         LEFT JOIN monhoc mh ON d.maMonHoc = mh.maMonHoc
         WHERE hs.maLop = ?
         ORDER BY hs.hoTen, mh.tenMonHoc`,
        [maLop]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy bảng điểm lớp: " + error.message);
    }
  }
  static async getScoresOfClass(maLop, maMonHoc, maHocKy) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
            d.maDiem,
            hs.maHocSinh,
            hs.hoTen,
            hs.gioiTinh,
            d.maMonHoc,
            d.maHocKy,
            d.diemMieng,
            d.diem15p,
            d.diem1tiet,
            d.diemGK,
            d.diemCK
         FROM hocsinh hs
         JOIN diem d ON d.maHocSinh = hs.maHocSinh
         WHERE hs.maLop = ?
           AND d.maMonHoc = ?
           AND d.maHocKy = ?
         ORDER BY hs.hoTen`,
        [maLop, maMonHoc, maHocKy]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách điểm: " + error.message);
    }
  }

  static async getScoreDetail(maDiem) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
            d.*,
            hs.hoTen,
            hs.gioiTinh,
            hs.maLop
         FROM diem d
         JOIN hocsinh hs ON hs.maHocSinh = d.maHocSinh
         WHERE d.maDiem = ?
         LIMIT 1`,
        [maDiem]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy chi tiết điểm: " + error.message);
    }
  }

  static getColumnByScoreType(loaiDiem) {
    const mapping = {
      diemMieng: "diemMieng",
      diem15p: "diem15p",
      diem1tiet: "diem1tiet",
      diemGK: "diemGK",
      diemCK: "diemCK",
    };
    return mapping[loaiDiem] || null;
  }
  
}

module.exports = DiemModel;