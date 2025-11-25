const { pool } = require("../config/db");

class StudentModel {
  // Lấy thông tin chi tiết học sinh 
  static async getStudentById(maHocSinh) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          hs.*, 
          l.tenLop, 
          l.khoi, 
          t.tenTruong,
          gv.hoTen AS tenGiaoVienChuNhiem
         FROM hocsinh hs
         LEFT JOIN lop l ON hs.maLop = l.maLop
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         LEFT JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE hs.maHocSinh = ? AND hs.tinhTrang = 'Đang học'`,
        [maHocSinh]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Lỗi model getStudentById:", error.message);
      throw new Error("Lỗi khi lấy thông tin học sinh: " + error.message);
    }
  }

  // Lấy danh sách học sinh theo lớp (dành cho điểm danh)
  static async getStudentsForAttendance(maLop) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         hs.maHocSinh,
         hs.hoTen,
         hs.ngaySinh,
         hs.gioiTinh,
         hs.namHoc,                    
         l.tenLop                      -- tên lớp cho đẹp (tùy chọn)
       FROM hocsinh hs
       LEFT JOIN lop l ON hs.maLop = l.maLop
       WHERE hs.maLop = ? 
         AND hs.tinhTrang = 'Đang học'
       ORDER BY hs.hoTen`,
      [maLop]
    );
    return rows;
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách học sinh: " + error.message);
  }
}

  // Lấy danh sách học sinh theo lớp (dùng cho API điểm danh)
  static async getStudentsByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT hs.maHocSinh, hs.hoTen, hs.ngaySinh, hs.gioiTinh, hs.diaChi,
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

  // Tìm kiếm học sinh theo tên hoặc MSSV
  static async searchStudents(keyword, maLop = null) {
    try {
      let query = `
        SELECT hs.maHocSinh, hs.hoTen, l.tenLop, l.khoi
        FROM hocsinh hs
        LEFT JOIN lop l ON hs.maLop = l.maLop
        WHERE (hs.hoTen LIKE ? OR hs.maHocSinh LIKE ?)
        AND hs.tinhTrang = 'Đang học'
      `;
      const params = [`%${keyword}%`, `%${keyword}%`];

      if (maLop) {
        query += " AND hs.maLop = ?";
        params.push(maLop);
      }

      query += " ORDER BY hs.hoTen LIMIT 50";

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm học sinh: " + error.message);
    }
  }

  // Lấy thống kê điểm danh của học sinh
  static async getStudentAttendanceStats(maHocSinh, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           COUNT(*) as tongSoBuoi,
           SUM(CASE WHEN trangThai = 'co_mat' THEN 1 ELSE 0 END) as soNgayCoMat,
           SUM(CASE WHEN trangThai = 'vang_mat' THEN 1 ELSE 0 END) as soNgayVang,
           SUM(CASE WHEN trangThai = 'muon' THEN 1 ELSE 0 END) as soNgayMuon,
           SUM(CASE WHEN trangThai = 'co_phep' THEN 1 ELSE 0 END) as soNgayCoPhep,
           ROUND((SUM(CASE WHEN trangThai = 'co_mat' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as tiLeDiHoc
         FROM diemداnh 
         WHERE maHocSinh = ? AND DATE(ngayDiemDanh) BETWEEN ? AND ?`,
        [maHocSinh, startDate, endDate]
      );

      return (
        rows[0] || {
          tongSoBuoi: 0,
          soNgayCoMat: 0,
          soNgayVang: 0,
          soNgayMuon: 0,
          soNgayCoPhep: 0,
          tiLeDiHoc: 0,
        }
      );
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy thống kê điểm danh học sinh: " + error.message
      );
    }
  }

  // Lấy lịch sử điểm danh gần đây của học sinh
  static async getRecentAttendance(maHocSinh, limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT dd.*, l.tenLop, gv.hoTen as tenGiaoVien
         FROM diemداnh dd
         LEFT JOIN lop l ON dd.maLop = l.maLop
         LEFT JOIN giaovien gv ON dd.maGiaoVien = gv.maGiaoVien
         WHERE dd.maHocSinh = ?
         ORDER BY dd.ngayDiemDanh DESC
         LIMIT ?`,
        [maHocSinh, limit]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy lịch sử điểm danh: " + error.message);
    }
  }

  // Cập nhật thông tin học sinh 
  static async updateStudent(maHocSinh, data) {
    try {
      const allowedFields = [
        "hoTen", "ngaySinh", "gioiTinh", "namHoc", "maLop",
        "diaChi", "tinhTrang", "soDienThoai", "email"
      ];

      const setParts = [];
      const values = [];

      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          setParts.push(`\`${field}\` = ?`);
          values.push(data[field]);
        }
      });

      if (setParts.length === 0) {
        return { success: false, message: "Không có dữ liệu để cập nhật" };
      }

      const query = `UPDATE hocsinh SET ${setParts.join(", ")} WHERE maHocSinh = ?`;
      values.push(maHocSinh);

      const [result] = await pool.execute(query, values);
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? "Cập nhật thành công" : "Không tìm thấy học sinh",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật thông tin học sinh: " + error.message);
    }
  }

  // Chuyển lớp cho học sinh
  static async transferStudent(maHocSinh, maLopMoi) {
    try {
      const [result] = await pool.execute(
        "UPDATE hocsinh SET maLop = ? WHERE maHocSinh = ?",
        [maLopMoi, maHocSinh]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Chuyển lớp thành công"
            : "Không tìm thấy học sinh",
      };
    } catch (error) {
      throw new Error("Lỗi khi chuyển lớp: " + error.message);
    }
  }

  //Chuyển lớp có cập nhật năm học
  static async _transferStudent(maHocSinh, maLopMoi, namHoc = null) {
    try {
      const [result] = await pool.execute(
        `UPDATE hocsinh 
         SET maLop = ?, namHoc = COALESCE(?, namHoc)
         WHERE maHocSinh = ?`,
        [maLopMoi, namHoc, maHocSinh]
      );

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows ? "Chuyển lớp thành công" : "Không tìm thấy học sinh",
      };
    } catch (error) {
      throw new Error("Lỗi khi chuyển lớp nâng cao: " + error.message);
    }
  }

  // Lấy danh sách học sinh có tỷ lệ vắng cao
  static async getStudentsWithHighAbsence(
    maLop,
    tiLeVangToiThieu = 20,
    startDate,
    endDate
  ) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           hs.maHocSinh, hs.hoTen,
           COUNT(dd.maDiemDanh) as tongSoBuoi,
           SUM(CASE WHEN dd.trangThai = 'Vắng' THEN 1 ELSE 0 END) as soNgayVang,
           ROUND((SUM(CASE WHEN dd.trangThai = 'Vắng' THEN 1 ELSE 0 END) / COUNT(dd.maDiemDanh)) * 100, 2) as tiLeVang,
           ph.hoTen as tenPhuHuynh, ph.SDT as sdtPhuHuynh
         FROM hocsinh hs
         LEFT JOIN kqdiemdanh dd ON hs.maHocSinh = dd.maHocSinh 
           AND dd.maLop = ? AND DATE(dd.thoiGian) BETWEEN ? AND ?
         LEFT JOIN phuhuynh ph ON hs.maPhuHuynh = ph.maPhuHuynh
         WHERE hs.maLop = ?
         GROUP BY hs.maHocSinh, hs.hoTen
         HAVING tiLeVang >= ?
         ORDER BY tiLeVang DESC`,
        [maLop, startDate, endDate, maLop, tiLeVangToiThieu]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách học sinh vắng nhiều: " + error.message
      );
    }
  }

  // Tạo học sinh mới 
  static async createStudent(data) {
    try {
      // kiểm tra lớp
      if (data.maLop) {
        const [lop] = await pool.execute("SELECT maLop FROM lop WHERE maLop = ?", [data.maLop]);
        if (lop.length === 0) {
          return { success: false, message: "Mã lớp không tồn tại" };
        }
      }

      // kiểm tra trùng tài khoản
      if (data.maTaiKhoan) {
        const [existing] = await pool.execute(
          "SELECT maTaiKhoan FROM hocsinh WHERE maTaiKhoan = ?",
          [data.maTaiKhoan]
        );
        if (existing.length > 0) {
          return { success: false, message: "Mã tài khoản đã được sử dụng" };
        }
      }

      await pool.execute(
        `INSERT INTO hocsinh 
          (maHocSinh, hoTen, ngaySinh, gioiTinh, namHoc, maLop, maTaiKhoan, diaChi, tinhTrang, anhChanDung)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
        [
          data.maHocSinh,
          data.hoTen,
          data.ngaySinh || null,
          data.gioiTinh,
          data.namHoc || null,
          data.maLop || null,
          data.maTaiKhoan || null,
          data.diaChi || null,
          data.tinhTrang || "Đang học",
        ]
      );

      return { success: true, message: "Tạo học sinh thành công" };
    } catch (error) {
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return { success: false, message: "Mã lớp không hợp lệ (FK error)" };
      }
      throw new Error("Lỗi khi tạo học sinh: " + error.message);
    }
  }

  static async getProfile(maHocSinh) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
            maHocSinh, 
            hoTen, 
            ngaySinh, 
            gioiTinh, 
            namHoc,
            maLop,
            diaChi,    
            tinhTrang,
            anhChanDung
        FROM hocsinh 
        WHERE maHocSinh = ?`,
        [maHocSinh]
      );

      return rows[0]; // Trả về object đầu tiên (hoặc undefined nếu không có)
    } catch (error) {
      throw new Error("Lỗi khi lấy thông tin hồ sơ: " + error.message);
    }
  }
  
  //Soft delete
  static async softDeleteStudent(maHocSinh) {
    try {
      const [result] = await pool.execute(
        `UPDATE hocsinh 
        SET tinhTrang = 'Nghỉ học'
        WHERE maHocSinh = ? AND tinhTrang = 'Đang học'`,  // chỉ cho phép xóa khi đang học
        [maHocSinh]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Không tìm thấy học sinh hoặc đã nghỉ học rồi",
        };
      }

      return {
        success: true,
        message: "Đã chuyển trạng thái học sinh thành Đã nghỉ học",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật trạng thái học sinh: " + error.message);
    }
  }

  //khôi phục học sinh
  static async restoreStudent(maHocSinh) {
    try {
      const [result] = await pool.execute(
        `UPDATE hocsinh 
        SET tinhTrang = 'Đang học'
        WHERE maHocSinh = ? AND tinhTrang = 'Nghỉ học'`,
        [maHocSinh]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Học sinh đang học hoặc không tồn tại",
        };
      }

      return {
        success: true,
        message: "Khôi phục học sinh thành công",
      };
    } catch (error) {
      throw new Error("Lỗi khi khôi phục học sinh: " + error.message);
    }
  }
}

module.exports = StudentModel;
