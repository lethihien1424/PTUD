const { pool } = require("../config/db");
const StudentModel = require("./HocSinhModel");
const { v4: uuidv4 } = require("uuid");

class AttendanceModel {
  // Tạo bản ghi điểm danh mới
  static async createAttendance(attendanceData) {
    const { maHocSinh, maLop, ngayDiemDanh, trangThai, ghiChu, maGiaoVien } =
      attendanceData;

    try {
      // Sinh mã điểm danh duy nhất
      const maDiemDanh = "DD" + Date.now() + Math.floor(Math.random() * 1000);
      const [result] = await pool.execute(
        `INSERT INTO kqdiemdanh (maDiemDanh, maHocSinh, maLop, thoiGian, trangThai, lyDo) 
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [maDiemDanh, maHocSinh, maLop, trangThai, ghiChu]
      );

      const student = await StudentModel.getStudentById(maHocSinh);
      const attendance = await AttendanceModel.getAttendanceByClassAndDate(
        maLop,
        ngayDiemDanh
      );

      return {
        success: true,
        maDiemDanh: result.insertId,
        message: "Tạo điểm danh thành công",
        data: {
          student,
          attendanceStatus: trangThai, // hoặc lấy từ attendance nếu muốn chi tiết hơn
        },
      };
    } catch (error) {
      throw new Error("Lỗi khi tạo điểm danh: " + error.message);
    }
  }

  // Cập nhật trạng thái điểm danh
  static async updateAttendance(maDiemDanh, updateData) {
    const { trangThai, ghiChu } = updateData;

    try {
      const [result] = await pool.execute(
        `UPDATE kqdiemdanh SET trangThai = ?, lyDo = ?, thoiGian = NOW() 
         WHERE maDiemDanh = ?`,
        [trangThai, ghiChu, maDiemDanh]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Cập nhật điểm danh thành công"
            : "Không tìm thấy bản ghi điểm danh",
      };
    } catch (error) {
      throw new Error("Lỗi khi cập nhật điểm danh: " + error.message);
    }
  }

  // Lấy danh sách điểm danh theo lớp và ngày
  static async getAttendanceByClassAndDate(maLop, ngayDiemDanh) {
    try {
      const [rows] = await pool.execute(
        `SELECT dd.*, hs.hoTen, hs.maHocSinh
         FROM kqdiemdanh dd
         LEFT JOIN hocsinh hs ON dd.maHocSinh = hs.maHocSinh
         WHERE dd.maLop = ? AND DATE(dd.thoiGian) = ?
         ORDER BY hs.hoTen`,
        [maLop, ngayDiemDanh]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách điểm danh: " + error.message);
    }
  }

  // Lấy danh sách điểm danh theo lớp và ngày (chỉ cho giáo viên chủ nhiệm)
  static async getAttendanceByClassAndDateForHomeRoomTeacher(
    maLop,
    ngayDiemDanh,
    maGiaoVien
  ) {
    try {
      // Kiểm tra giáo viên có phải chủ nhiệm của lớp không
      const [checkPermission] = await pool.execute(
        `SELECT l.maLop 
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE l.maLop = ? AND gv.maGV = ? AND gv.chucVu = 'GVCN' AND gv.trangThai = 1`,
        [maLop, maGiaoVien]
      );

      if (checkPermission.length === 0) {
        throw new Error("Bạn không có quyền xem điểm danh của lớp này");
      }

      const [rows] = await pool.execute(
        `SELECT dd.*, hs.hoTen, hs.maHocSinh
         FROM kqdiemdanh dd
         LEFT JOIN hocsinh hs ON dd.maHocSinh = hs.maHocSinh
         WHERE dd.maLop = ? AND DATE(dd.thoiGian) = ?
         ORDER BY hs.hoTen`,
        [maLop, ngayDiemDanh]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách điểm danh: " + error.message);
    }
  }

  // Lấy lịch sử điểm danh của một học sinh
  static async getStudentAttendanceHistory(maHocSinh, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT dd.*, l.tenLop
         FROM kqdiemdanh dd
         LEFT JOIN lop l ON dd.maLop = l.maLop
         WHERE dd.maHocSinh = ? AND DATE(dd.thoiGian) BETWEEN ? AND ?
         ORDER BY dd.thoiGian DESC`,
        [maHocSinh, startDate, endDate]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy lịch sử điểm danh: " + error.message);
    }
  }

  // Thống kê điểm danh theo lớp trong khoảng thời gian
  static async getAttendanceStatistics(maLop, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           hs.maHocSinh,
           hs.hoTen,
           COUNT(dd.maDiemDanh) as tongSoBuoi,
           SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) as soNgayCoMat,
           SUM(CASE WHEN dd.trangThai = 'Vắng' THEN 1 ELSE 0 END) as soNgayVang,
           SUM(CASE WHEN dd.trangThai = 'muon' THEN 1 ELSE 0 END) as soNgayMuon,
           SUM(CASE WHEN dd.trangThai = 'Có phép' THEN 1 ELSE 0 END) as soNgayCoPhep,
           SUM(CASE WHEN dd.trangThai = 'Không phép' THEN 1 ELSE 0 END) as soNgayKhongPhep,
           ROUND((SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) / COUNT(dd.maDiemDanh)) * 100, 2) as tiLeDiHoc
         FROM hocsinh hs
         LEFT JOIN kqdiemdanh dd ON hs.maHocSinh = dd.maHocSinh 
           AND dd.maLop = ? AND DATE(dd.thoiGian) BETWEEN ? AND ?
         WHERE hs.maLop = ?
         GROUP BY hs.maHocSinh, hs.hoTen
         ORDER BY hs.hoTen`,
        [maLop, startDate, endDate, maLop]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê điểm danh: " + error.message);
    }
  }

  // Thống kê điểm danh theo lớp (chỉ cho giáo viên chủ nhiệm)
  static async getAttendanceStatisticsForHomeRoomTeacher(
    maLop,
    startDate,
    endDate,
    maGiaoVien
  ) {
    try {
      // Kiểm tra quyền truy cập
      const [checkPermission] = await pool.execute(
        `SELECT l.maLop 
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE l.maLop = ? AND gv.maGV = ? AND gv.chucVu = 'GVCN' AND gv.trangThai = 1`,
        [maLop, maGiaoVien]
      );

      if (checkPermission.length === 0) {
        throw new Error(
          "Bạn không có quyền xem thống kê điểm danh của lớp này"
        );
      }

      const [rows] = await pool.execute(
        `SELECT 
           hs.maHocSinh,
           hs.hoTen,
           COUNT(dd.maDiemDanh) as tongSoBuoi,
           SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) as soNgayCoMat,
           SUM(CASE WHEN dd.trangThai = 'Vắng' THEN 1 ELSE 0 END) as soNgayVang,
           SUM(CASE WHEN dd.trangThai = 'muon' THEN 1 ELSE 0 END) as soNgayMuon,
           SUM(CASE WHEN dd.trangThai = 'Có phép' THEN 1 ELSE 0 END) as soNgayCoPhep,
           SUM(CASE WHEN dd.trangThai = 'Không phép' THEN 1 ELSE 0 END) as soNgayKhongPhep,
           ROUND((SUM(CASE WHEN dd.trangThai = 'co_mat' THEN 1 ELSE 0 END) / COUNT(dd.maDiemDanh)) * 100, 2) as tiLeDiHoc
         FROM hocsinh hs
         LEFT JOIN kqdiemdanh dd ON hs.maHocSinh = dd.maHocSinh 
           AND dd.maLop = ? AND DATE(dd.thoiGian) BETWEEN ? AND ?
         WHERE hs.maLop = ?
         GROUP BY hs.maHocSinh, hs.hoTen
         ORDER BY hs.hoTen`,
        [maLop, startDate, endDate, maLop]
      );

      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy thống kê điểm danh: " + error.message);
    }
  }

  // Lấy danh sách lớp mà giáo viên chủ nhiệm có thể xem điểm danh
  static async getClassesForHomeRoomTeacher(maGiaoVien) {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, t.tenTruong,
                COUNT(hs.maHocSinh) as soHocSinh
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         LEFT JOIN truong t ON l.maTruong = t.maTruong
         LEFT JOIN hocsinh hs ON l.maLop = hs.maLop
         WHERE gv.maGV = ? AND gv.chucVu = 'GVCN' AND gv.trangThai = 1
         GROUP BY l.maLop
         ORDER BY l.tenLop`,
        [maGiaoVien]
      );

      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy danh sách lớp của giáo viên chủ nhiệm: " + error.message
      );
    }
  }

  // Kiểm tra điểm danh đã tồn tại chưa
  static async checkAttendanceExists(maHocSinh, maLop, ngayDiemDanh) {
    try {
      const [rows] = await pool.execute(
        `SELECT maDiemDanh FROM kqdiemdanh 
         WHERE maHocSinh = ? AND maLop = ? AND DATE(thoiGian) = ?`,
        [maHocSinh, maLop, ngayDiemDanh]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Lỗi khi kiểm tra điểm danh: " + error.message);
    }
  }

  // Điểm danh hàng loạt cho cả lớp
  static async bulkCreateAttendance(attendanceList) {
    try {
      const values = attendanceList.map((item) => [
        item.maDiemDanh ||
          "DD" + Date.now() + Math.floor(Math.random() * 10000),
        item.maHocSinh,
        item.maLop,
        item.ngayDiemDanh,
        item.trangThai,
        item.ghiChu || null,
        null, // maGiaoVien nếu cần
      ]);
      // ...existing code insert...
    } catch (error) {
      throw new Error("Lỗi khi điểm danh hàng loạt: " + error.message);
    }
  }

  // Tạo điểm danh (chỉ cho giáo viên chủ nhiệm của lớp)
  static async createAttendanceForHomeRoomTeacher(attendanceData) {
    const { maHocSinh, maLop, ngayDiemDanh, trangThai, ghiChu, maGiaoVien } =
      attendanceData;

    try {
      // Kiểm tra quyền tạo điểm danh
      const [checkPermission] = await pool.execute(
        `SELECT l.maLop 
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE l.maLop = ? AND gv.maGV = ? AND gv.chucVu = 'GVCN' AND gv.trangThai = 1`,
        [maLop, maGiaoVien]
      );

      if (checkPermission.length === 0) {
        throw new Error("Bạn không có quyền tạo điểm danh cho lớp này");
      }

      const maDiemDanh = "DD" + Date.now() + Math.floor(Math.random() * 1000);
      const [result] = await pool.execute(
        `INSERT INTO kqdiemdanh (maHocSinh, maLop, thoiGian, trangThai, lyDo) 
         VALUES (?, ?, NOW(), ?, ?)`,
        [maHocSinh, maLop, trangThai, ghiChu]
      );

      const student = await StudentModel.getStudentById(maHocSinh);
      const attendance = await AttendanceModel.getAttendanceByClassAndDate(
        maLop,
        ngayDiemDanh
      );

      return {
        success: true,
        maDiemDanh: result.insertId,
        message: "Tạo điểm danh thành công",
        data: {
          student,
          attendanceStatus: trangThai, // hoặc lấy từ attendance nếu muốn chi tiết hơn
        },
      };
    } catch (error) {
      throw new Error("Lỗi khi tạo điểm danh: " + error.message);
    }
  }

  // Điểm danh hàng loạt (chỉ cho giáo viên chủ nhiệm)
  static async bulkCreateAttendanceForHomeRoomTeacher(
    attendanceList,
    maGiaoVien
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Lấy maLop từ danh sách điểm danh đầu tiên
      const maLop = attendanceList[0]?.maLop;

      if (!maLop) {
        throw new Error("Không có thông tin lớp học");
      }

      // Kiểm tra quyền điểm danh
      const [checkPermission] = await connection.execute(
        `SELECT l.maLop 
         FROM lop l
         INNER JOIN giaovien gv ON l.maGVChuNhiem = gv.maGV
         WHERE l.maLop = ? AND gv.maGV = ? AND gv.chucVu = 'GVCN' AND gv.trangThai = 1`,
        [maLop, maGiaoVien]
      );

      if (checkPermission.length === 0) {
        throw new Error("Bạn không có quyền điểm danh cho lớp này");
      }

      const results = [];

      for (const attendance of attendanceList) {
        const { maHocSinh, maLop, ngayDiemDanh, trangThai, ghiChu } =
          attendance;

        // Kiểm tra xem đã có điểm danh chưa
        const existing = await this.checkAttendanceExists(
          maHocSinh,
          maLop,
          ngayDiemDanh
        );

        if (existing) {
          // Cập nhật nếu đã tồn tại
          await connection.execute(
            `UPDATE kqdiemdanh SET trangThai = ?, lyDo = ?, thoiGian = NOW() 
             WHERE maDiemDanh = ?`,
            [trangThai, ghiChu, existing.maDiemDanh]
          );

          results.push({
            maHocSinh,
            action: "updated",
            maDiemDanh: existing.maDiemDanh,
          });
        } else {
          // Tạo mới nếu chưa tồn tại
          const [result] = await connection.execute(
            `INSERT INTO kqdiemdanh (maHocSinh, maLop, thoiGian, trangThai, lyDo) 
             VALUES (?, ?, NOW(), ?, ?)`,
            [maHocSinh, maLop, trangThai, ghiChu]
          );

          results.push({
            maHocSinh,
            action: "created",
            maDiemDanh: result.insertId,
          });
        }
      }

      await connection.commit();

      return {
        success: true,
        results,
        message: "Điểm danh hàng loạt thành công",
      };
    } catch (error) {
      await connection.rollback();
      throw new Error("Lỗi khi điểm danh hàng loạt: " + error.message);
    } finally {
      connection.release();
    }
  }

  // Xóa bản ghi điểm danh
  static async deleteAttendance(maDiemDanh) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM kqdiemdanh WHERE maDiemDanh = ?",
        [maDiemDanh]
      );

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Xóa điểm danh thành công"
            : "Không tìm thấy bản ghi điểm danh",
      };
    } catch (error) {
      throw new Error("Lỗi khi xóa điểm danh: " + error.message);
    }
  }

  // Lấy toàn bộ lịch sử điểm danh của lớp
  static async getAttendanceHistoryByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM kqdiemdanh WHERE maLop = ? ORDER BY thoiGian DESC",
        [maLop]
      );
      return rows;
    } catch (error) {
      throw new Error(
        "Lỗi khi lấy lịch sử điểm danh của lớp: " + error.message
      );
    }
  }

  // Lấy toàn bộ điểm danh của một lớp
  static async getAllAttendanceByClass(maLop) {
    try {
      const [rows] = await pool.execute(
        `SELECT dd.*, hs.hoTen
         FROM kqdiemdanh dd
         LEFT JOIN hocsinh hs ON dd.maHocSinh = hs.maHocSinh
         WHERE dd.maLop = ?
         ORDER BY dd.thoiGian DESC`,
        [maLop]
      );
      return rows;
    } catch (error) {
      throw new Error("Lỗi khi lấy toàn bộ điểm danh lớp: " + error.message);
    }
  }
}

module.exports = AttendanceModel;
