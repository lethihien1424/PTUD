const { pool } = require("../config/db");

class ClassModel {
  // Lấy thông tin lớp theo mã lớp
  static async getClassById(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, t.tenTruong, gv.hoTen as tenGiaoVienChuNhiem
        FROM lop l
        LEFT JOIN truong t ON l.maTruong = t.maTruong
        LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
        WHERE l.maLop = ?`,
        [maLop]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin lớp: " + error.message);
    }
  }

  // Lấy danh sách học sinh trong lớp
  static async getStudentsByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT hs.maHocSinh, hs.hoTen, hs.ngaySinh, hs.gioiTinh,
                hs.diaChi,
                ph.hoTen as tenPhuHuynh, ph.SDT as sdtPhuHuynh
        FROM hocsinh hs
        LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
        WHERE hs.maLop = ?
        ORDER BY hs.hoTen`,
        [maLop]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách học sinh: " + error.message);
    }
  }

  // Lấy danh sách lớp theo giáo viên
  static async getClassesByTeacher(maGiaoVien) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, t.tenTruong,
                COUNT(hs.maHocSinh) as soHocSinh
        FROM lop l
        LEFT JOIN truong t ON l.maTruong = t.maTruong
        LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
        WHERE l.maGVChuNhiem = ?
        GROUP BY l.maLop
        ORDER BY l.tenLop`,
        [maGiaoVien]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp của giáo viên: " + error.message
      );
    }
  }

  // Lấy thống kê tổng quan của lớp
  static async getClassStatistics(maLop, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(DISTINCT hs.maHocSinh) as tongHocSinh,
          COUNT(DISTINCT DATE(dd.ngayDiemDanh)) as tongNgayDiemDanh,
          COUNT(dd.maDiemDanh) as tongLuotDiemDanh,
          SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) as tongCoMat,
          SUM(CASE WHEN dd.trangThai = 'vang_mat' THEN 1 ELSE 0 END) as tongVang,
          SUM(CASE WHEN dd.trangThai = 'muon' THEN 1 ELSE 0 END) as tongMuon,
          SUM(CASE WHEN dd.trangThai = 'co_phep' THEN 1 ELSE 0 END) as tongCoPhep,
           ROUND(AVG(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) * 100, 2) as tiLeDiHocTrungBinh
        FROM hocsinh hs
         LEFT JOIN diemداnh dd ON hs.maHocSinh = dd.maHocSinh 
          AND dd.maLop = ? AND DATE(dd.ngayDiemDanh) BETWEEN ? AND ?
        WHERE hs.maLop = ?`,
        [maLop, startDate, endDate, maLop]
      );

      return rows[0] || {};
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê lớp: " + error.message);
    }
  }

  // Lấy danh sách lớp theo trường
  static async getClassesBySchool(maTruong) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, gv.hoTen as tenGiaoVienChuNhiem,
                COUNT(hs.maHocSinh) as soHocSinh
        FROM lop l
        LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
        LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
        WHERE l.maTruong = ?
        GROUP BY l.maLop
        ORDER BY l.khoi, l.tenLop`,
        [maTruong]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp theo trường: " + error.message
      );
    }
  }

  // Cập nhật thông tin lớp
  static async updateClass(maLop, updateData) {
    const { tenLop, khoi, maGVChuNhiem } = updateData;

    try {
      const [result] = await pool.execute(
        `UPDATE lop SET tenLop = ?, khoi = ?, maGVChuNhiem = ? 
        WHERE maLop = ?`,
        [tenLop, khoi, maGVChuNhiem, maLop]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Cập nhật lớp thành công"
            : "Không tìm thấy lớp",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật lớp: " + error.message);
    }
  }

  // Tạo lớp mới
  static async createClass(classData) {
    const { tenLop, khoi, maTruong, maGVChuNhiem } = classData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO lop (tenLop, khoi, maTruong, maGVChuNhiem) 
        VALUES (?, ?, ?, ?)`,
        [tenLop, khoi, maTruong, maGVChuNhiem]
      );

      return {
        success: true,
        maLop: result.insertId,
        message: "Tạo lớp thành công",
      };
    } catch (error) {
      throw new Error("Lỗi khi tạo lớp: " + error.message);
    }
  }

  static async getLopDayByGiaoVien(maGiaoVien) {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT 
          l.maLop, 
          l.tenLop,
          l.khoi
        FROM bangphancong pc
        JOIN lop l ON pc.maLop = l.maLop
        WHERE pc.maGV = ?
        ORDER BY l.khoi, l.tenLop`,
        [maGiaoVien]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách lớp dạy: " + error.message);
    }
  }

  // Lấy tất cả các lớp (cho API điểm danh)
  static async getAllClasses() {
    try {
      const [rows] = await pool.execute(
        `SELECT l.maLop, l.tenLop, l.khoi, l.siSo,
                gv.hoTen as tenGiaoVienChuNhiem,
                t.tenTruong,
                COUNT(hs.maHocSinh) as soHocSinh
        FROM lop l
        LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
        LEFT JOIN truong t ON l.maTruong = t.maTruong
        LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
        GROUP BY l.maLop
        ORDER BY l.khoi, l.tenLop`
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách tất cả lớp: " + error.message);
    }
  }

  // Lấy danh sách lớp theo niên khóa
  static async getClassesByNienKhoa(nienKhoa) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.maLop, l.tenLop, l.khoi, l.siSo,
                gv.hoTen as tenGiaoVienChuNhiem,
                t.tenTruong,
                COUNT(hs.maHocSinh) as soHocSinh
        FROM lop l
        LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
        LEFT JOIN truong t ON l.maTruong = t.maTruong
        LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
        WHERE l.nienKhoa = ?
        GROUP BY l.maLop
        ORDER BY l.khoi, l.tenLop`,
        [nienKhoa]
      );
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp theo niên khóa: " + error.message
      );
    }
  }

  //Lấy TẤT CẢ các lớp học (cho bảng chính)
  static async findAll() {
    try {
      const sql = `
                SELECT 
                    l.maLop AS id,
                    l.tenLop AS name,
                    l.khoi AS grade,
                    gv.hoTen AS homeroomTeacher,
                    l.siSo AS studentCount, 
                    'Chưa xác định' AS subjectCombination, -- CSDL (lop) không có cột này, tạm hardcode
                    CURDATE() AS createdDate -- CSDL (lop) không có cột này, tạm hardcode
                FROM lop l
                LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
                ORDER BY l.khoi, l.tenLop
            `;
      // Dùng pool.query vì không có tham số
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      throw new Error("Lỗi Model khi lấy danh sách lớp: " + error.message);
    }
  }

  //Đếm số lớp trong một khối (Hỗ trợ Controller tạo tên lớp)
  static async countByGrade(khoi) {
    try {
      const sql = `SELECT COUNT(*) as count FROM lop WHERE khoi = ?`;
      const [rows] = await pool.execute(sql, [khoi]);
      return rows[0].count;
    } catch (error) {
      throw new Error("Lỗi Model khi đếm lớp: " + error.message);
    }
  }

  //Tạo lớp mới (Khớp với CSDL ptud, yêu cầu maLop, tenLop, khoi, siSo, maGVChuNhiem, maTruong)
  static async create(classData) {
    // Lấy dữ liệu từ Controller
    const { maLop, tenLop, khoi, siSo, maGVChuNhiem, maTruong } = classData;
    try {
      const sql = `
                INSERT INTO lop (maLop, tenLop, khoi, siSo, phongHoc, maGVChuNhiem, maTruong)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
      // CSDL yêu cầu 'phongHoc', tạm thời hardcode là 0 (hoặc 1 phòng mặc định)
      const params = [maLop, tenLop, khoi, siSo, 0, maGVChuNhiem, maTruong];

      const [result] = await pool.execute(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi Model khi tạo lớp: " + error.message);
    }
  }

  //Cập nhật lớp(Giao diện yêu cầu cập nhật siSo và maGVChuNhiem)
  static async update(maLop, classData) {
    const { maGVChuNhiem, siSo } = classData;
    try {
      const sql = `
                UPDATE lop 
                SET maGVChuNhiem = ?, siSo = ?
                WHERE maLop = ?
            `;
      const params = [maGVChuNhiem, siSo, maLop];
      const [result] = await pool.execute(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Lỗi Model khi cập nhật lớp: " + error.message);
    }
  }

  //Xóa lớp (Hàm này được yêu cầu bởi giao diện ClassManagement.tsx)
  static async delete(maLop) {
    try {
      const sql = `DELETE FROM lop WHERE maLop = ?`;
      const [result] = await pool.execute(sql, [maLop]);
      return result.affectedRows > 0;
    } catch (error) {
      // Xử lý lỗi khóa ngoại (nếu lớp còn học sinh, CSDL sẽ chặn)
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error("Không thể xóa lớp này vì vẫn còn học sinh trong lớp.");
      }
      throw new Error("Lỗi Model khi xóa lớp: " + error.message);
    }
  }
}

module.exports = ClassModel;
