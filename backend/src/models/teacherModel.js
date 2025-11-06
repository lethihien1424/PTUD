const { pool } = require("../config/db");

class TeacherModel {
  // Lấy thông tin chi tiết giáo viên theo mã
  static async getTeacherById(maGV) {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.*, tk.tenDangNhap, tk.loaiTaiKhoan,
                t.tenTruong
         FROM giaovien gv
         LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
         LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         WHERE gv.maGV = ?
         GROUP BY gv.maGV`,
        [maGV]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin giáo viên: " + error.message);
    }
  }

  // Lấy danh sách tất cả giáo viên
  static async getAllTeachers(includeInactive = false) {
    try {
      let query = `
        SELECT gv.*, tk.tenDangNhap, tk.loaiTaiKhoan,
               COUNT(l.maLop) as soLopChuNhiem
        FROM giaovien gv
        LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
        LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
      `;
      
      if (!includeInactive) {
        query += " WHERE gv.trangThai = 1";
      }
      
      query += " GROUP BY gv.maGV ORDER BY gv.hoTen";
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên: " + error.message);
    }
  }

  // Tìm kiếm giáo viên theo tên, chuyên môn, chức vụ
  static async searchTeachers(keyword, trangThai = null) {
    try {
      let query = `
        SELECT gv.*, tk.tenDangNhap,
               COUNT(l.maLop) as soLopChuNhiem
        FROM giaovien gv
        LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
        LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
        WHERE (gv.hoTen LIKE ? OR gv.chuyenMon LIKE ? OR gv.chucVu LIKE ?)
      `;
      
      const params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];
      
      if (trangThai !== null) {
        query += " AND gv.trangThai = ?";
        params.push(trangThai);
      }
      
      query += " GROUP BY gv.maGV ORDER BY gv.hoTen LIMIT 50";
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm giáo viên: " + error.message);
    }
  }

  // Thêm giáo viên mới
  static async createTeacher(teacherData) {
    const { 
      maGV, hoTen, CCCD, diaChi, ngayBatDau, chuyenMon, 
      chucVu, SDT, email, maTaiKhoan 
    } = teacherData;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Kiểm tra mã giáo viên đã tồn tại chưa
      const [existing] = await connection.execute(
        "SELECT maGV FROM giaovien WHERE maGV = ?",
        [maGV]
      );
      
      if (existing.length > 0) {
        throw new Error("Mã giáo viên đã tồn tại");
      }
      
      // Kiểm tra CCCD đã tồn tại chưa
      const [existingCCCD] = await connection.execute(
        "SELECT maGV FROM giaovien WHERE CCCD = ?",
        [CCCD]
      );
      
      if (existingCCCD.length > 0) {
        throw new Error("Số CCCD đã tồn tại trong hệ thống");
      }
      
      // Thêm giáo viên mới với trạng thái hoạt động (1)
      await connection.execute(
        `INSERT INTO giaovien 
         (maGV, hoTen, CCCD, diaChi, ngayBatDau, chuyenMon, chucVu, 
          ngayKetThuc, trangThai, SDT, maTaiKhoan, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, '9999-12-31', 1, ?, ?, ?)`,

        [maGV, hoTen, CCCD, diaChi, ngayBatDau, chuyenMon, chucVu, SDT, maTaiKhoan, email]
      );
      
      await connection.commit();
      
      return {
        success: true,
        maGV: maGV,
        message: "Thêm giáo viên thành công"
      };
      
    } catch (error) {
      await connection.rollback();
      throw new Error("Lỗi khi thêm giáo viên: " + error.message);
    } finally {
      connection.release();
    }
  }

  // Cập nhật thông tin giáo viên
  static async updateTeacher(maGV, updateData) {
    const { 
      hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email 
    } = updateData;
    
    try {
      // Kiểm tra CCCD trùng với giáo viên khác
      const [existingCCCD] = await pool.execute(
        "SELECT maGV FROM giaovien WHERE CCCD = ? AND maGV != ?",
        [CCCD, maGV]
      );
      
      if (existingCCCD.length > 0) {
        throw new Error("Số CCCD đã tồn tại với giáo viên khác");
      }
      
      const [result] = await pool.execute(
        `UPDATE giaovien 
         SET hoTen = ?, CCCD = ?, diaChi = ?, chuyenMon = ?, 
             chucVu = ?, SDT = ?, email = ?
         WHERE maGV = ?`,
        [hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email, maGV]
      );
      
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? "Cập nhật thông tin giáo viên thành công" : "Không tìm thấy giáo viên"
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật thông tin giáo viên: " + error.message);
    }
  }

  // Cập nhật trạng thái giáo viên (nghỉ việc thay vì xóa)
  static async updateTeacherStatus(maGV, trangThai, ngayKetThuc = null) {
    try {
      let query = "UPDATE giaovien SET trangThai = ?";
      let params = [trangThai];
      
      // Nếu nghỉ việc (trangThai = 0), cập nhật ngày kết thúc
      if (trangThai === 0 && ngayKetThuc) {
        query += ", ngayKetThuc = ?";
        params.push(ngayKetThuc);
      }
      
      // Nếu trở lại làm việc (trangThai = 1), đặt lại ngày kết thúc
      if (trangThai === 1) {
        query += ", ngayKetThuc = '9999-12-31'";
      }
      
      query += " WHERE maGV = ?";
      params.push(maGV);
      
      const [result] = await pool.execute(query, params);
      
      const statusText = trangThai === 1 ? "kích hoạt" : "nghỉ việc";
      
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 
          `Cập nhật trạng thái ${statusText} thành công` : 
          "Không tìm thấy giáo viên"
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật trạng thái giáo viên: " + error.message);
    }
  }

  // Lấy danh sách lớp mà giáo viên chủ nhiệm
  static async getClassesByTeacher(maGV) {
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
        [maGV]
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách lớp của giáo viên: " + error.message);
    }
  }

  // Lấy thống kê giáo viên theo chuyên môn
  static async getTeacherStatsBySubject() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           chuyenMon,
           COUNT(*) as tongSo,
           SUM(CASE WHEN trangThai = 1 THEN 1 ELSE 0 END) as dangLamViec,
           SUM(CASE WHEN trangThai = 0 THEN 1 ELSE 0 END) as nghiViec
         FROM giaovien 
         GROUP BY chuyenMon
         ORDER BY tongSo DESC`
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê giáo viên: " + error.message);
    }
  }

  // Lấy thống kê giáo viên theo chức vụ
  static async getTeacherStatsByPosition() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           chucVu,
           COUNT(*) as tongSo,
           SUM(CASE WHEN trangThai = 1 THEN 1 ELSE 0 END) as dangLamViec,
           SUM(CASE WHEN trangThai = 0 THEN 1 ELSE 0 END) as nghiViec
         FROM giaovien 
         GROUP BY chucVu
         ORDER BY tongSo DESC`
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê theo chức vụ: " + error.message);
    }
  }

  // Lấy danh sách giáo viên có thể làm chủ nhiệm (đang hoạt động và chưa chủ nhiệm lớp nào)
  static async getAvailableHomeRoomTeachers() {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.maGV, gv.hoTen, gv.chuyenMon, gv.chucVu
         FROM giaovien gv
         LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
         WHERE gv.trangThai = 1 AND l.maGVChuNhiem IS NULL
         ORDER BY gv.hoTen`
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên có thể làm chủ nhiệm: " + error.message);
    }
  }

  // Kiểm tra giáo viên có đang chủ nhiệm lớp nào không
  static async checkHomeRoomStatus(maGV) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.maLop, l.tenLop, l.khoi
         FROM lop l
         WHERE l.maGVChuNhiem = ?`,
        [maGV]
      );
      
      return {
        isHomeRoomTeacher: rows.length > 0,
        classes: rows
      };
    } catch (error) {
      throw new Error("Lỗi khi kiểm tra trạng thái chủ nhiệm: " + error.message);
    }
  }

  // Lấy danh sách giáo viên sắp nghỉ hưu (dựa trên thời gian làm việc)
  static async getTeachersNearRetirement(yearsThreshold = 30) {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.*, 
                TIMESTAMPDIFF(YEAR, gv.ngayBatDau, CURDATE()) as soNamLamViec
         FROM giaovien gv
         WHERE gv.trangThai = 1 
           AND TIMESTAMPDIFF(YEAR, gv.ngayBatDau, CURDATE()) >= ?
         ORDER BY soNamLamViec DESC`,
        [yearsThreshold]
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên sắp nghỉ hưu: " + error.message);
    }
  }

  // Lấy danh sách giáo viên theo chuyên môn
  static async getTeachersBySubject(chuyenMon) {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.*, tk.tenDangNhap,
                COUNT(l.maLop) as soLopChuNhiem
         FROM giaovien gv
         LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
         LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
         WHERE gv.chuyenMon = ? AND gv.trangThai = 1
         GROUP BY gv.maGV
         ORDER BY gv.hoTen`,
        [chuyenMon]
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên theo chuyên môn: " + error.message);
    }
  }

  // Lấy danh sách giáo viên chủ nhiệm (theo chức vụ GVCN)
  static async getHomeRoomTeachers() {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.*, tk.tenDangNhap, tk.loaiTaiKhoan,
                l.maLop, l.tenLop, l.khoi,
                COUNT(hs.maHocSinh) as soHocSinh
         FROM giaovien gv
         LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
         LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
         LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
         WHERE gv.trangThai = 1 AND gv.chucVu = 'GVCN'
         GROUP BY gv.maGV
         ORDER BY gv.hoTen`,
        []
      );
      
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách giáo viên chủ nhiệm: " + error.message);
    }
  }

  // Kiểm tra giáo viên có phải chủ nhiệm của lớp không
  static async isHomeRoomTeacherOfClass(maGV, maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.maLop, gv.chucVu
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE gv.maGV = ? AND l.maLop = ? AND gv.chucVu = 'GVCN'`,
        [maGV, maLop]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw new Error("Lỗi khi kiểm tra quyền chủ nhiệm: " + error.message);
    }
  }

  // Lấy thông tin giáo viên từ mã tài khoản (để dùng trong middleware)
  static async getTeacherByAccountId(maTaiKhoan) {
    try {
      const [rows] = await pool.execute(
        `SELECT gv.*, l.maLop, l.tenLop
         FROM giaovien gv
         LEFT JOIN lop l ON gv.maGV = l.maGVChuNhiem
         WHERE gv.maTaiKhoan = ? AND gv.trangThai = 1`,
        [maTaiKhoan]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin giáo viên theo tài khoản: " + error.message);
    }
  }
}

module.exports = TeacherModel;