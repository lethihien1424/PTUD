const UserModel = require("../models/TaiKhoanModel");
const { pool } = require("../config/db");
const crypto = require("crypto");

class TeacherController {
  // Thêm giáo viên mới (chỉ giáo vụ + tự động tạo tài khoản)
  static async createTeacher(req, res) {
    try {
      const {
        hoTen,
        CCCD,
        diaChi,
        ngayBatDau,
        chuyenMon,
        chucVu,
        SDT,
        email = "",
      } = req.body;

      const { loaiTaiKhoan: userRole } = req.user;

      // Chỉ giáo vụ mới được thêm giáo viên
      if (userRole !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền thêm giáo viên",
        });
      }

      // Validate input bắt buộc
      if (
        !hoTen ||
        !CCCD ||
        !diaChi ||
        !ngayBatDau ||
        !chuyenMon ||
        !chucVu ||
        !SDT ||
        !email
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin bắt buộc (bao gồm email)",
        });
      }

      // Kiểm tra CCCD đã tồn tại chưa
      const [existingTeacher] = await pool.execute(
        "SELECT maGV FROM giaovien WHERE CCCD = ? AND trangThai = 1",
        [CCCD]
      );

      if (existingTeacher.length > 0) {
        return res.status(400).json({
          success: false,
          message: "CCCD đã tồn tại trong hệ thống",
        });
      }

      // Xác định loại tài khoản dựa trên chức vụ
      let loaiTaiKhoan = "giaovien";
      if (chucVu === "GVCN") {
        loaiTaiKhoan = "gvcn";
      }

      // Sinh mã tài khoản tự động
      const [rows] = await pool.execute(
        "SELECT maTaiKhoan FROM taikhoan WHERE maTaiKhoan LIKE 'TKGV%' ORDER BY maTaiKhoan DESC LIMIT 1"
      );
      let newNumber = 1;
      if (rows.length > 0) {
        const lastCode = rows[0].maTaiKhoan;
        newNumber = parseInt(lastCode.replace("TKGV", "")) + 1;
      }
      const maTaiKhoan = `TKGV${String(newNumber).padStart(3, "0")}`;
      const tenDangNhap = email.split("@")[0];
      const matKhau = crypto.createHash("md5").update("123456").digest("hex");

      // Tạo tài khoản
      const success = await UserModel.createDefaultAccount(
        maTaiKhoan,
        tenDangNhap,
        matKhau,
        loaiTaiKhoan
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Không thể tạo tài khoản",
        });
      }

      // Bước 2: Tạo mã giáo viên
      const maGV = await TeacherController.generateTeacherId();

      // Bước 3: Thêm thông tin giáo viên vào bảng giaovien
      const [result] = await pool.execute(
        `INSERT INTO giaovien (maGV, hoTen, CCCD, diaChi, ngayBatDau, chuyenMon, chucVu, trangThai, SDT, maTaiKhoan, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [
          maGV,
          hoTen,
          CCCD,
          diaChi,
          ngayBatDau,
          chuyenMon,
          chucVu,
          SDT,
          maTaiKhoan,
          email,
        ]
      );

      if (result.affectedRows > 0) {
        res.status(201).json({
          success: true,
          message: "Thêm giáo viên thành công",
          data: {
            teacher: {
              maGV,
              hoTen,
              chucVu,
              email,
              SDT,
            },
            account: {
              maTaiKhoan,
              tenDangNhap,
              defaultPassword: "123",
              loaiTaiKhoan,
            },
            loginInfo: {
              message: `Tài khoản đã được tạo cho giáo viên ${hoTen}`,
              username: tenDangNhap,
              password: "123",
              note: "Vui lòng thông báo cho giáo viên đăng nhập và đổi mật khẩu ngay",
            },
          },
        });
      } else {
        // Rollback: Xóa tài khoản đã tạo
        await pool.execute("DELETE FROM taikhoan WHERE maTaiKhoan = ?", [
          maTaiKhoan,
        ]);

        res.status(400).json({
          success: false,
          message: "Không thể thêm giáo viên",
        });
      }
    } catch (error) {
      console.error("Lỗi thêm giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Cập nhật thông tin giáo viên (chỉ giáo vụ)
  static async updateTeacher(req, res) {
    try {
      const { maGV } = req.params;
      const { hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email } = req.body;
      const { loaiTaiKhoan: userRole } = req.user;

      // Chỉ giáo vụ mới có quyền sửa
      if (userRole !== "giaovu" && userRole !== "bangiamhieu") {
        return res.status(403).json({
          success: false,
          message:
            "Chỉ giáo vụ và ban giám hiệu mới có quyền cập nhật thông tin giáo viên",
        });
      }

      // Kiểm tra giáo viên có tồn tại không TRƯỚC KHI validate
      const [existingTeacher] = await pool.execute(
        "SELECT maTaiKhoan FROM giaovien WHERE maGV = ? AND trangThai = 1",
        [maGV]
      );

      if (!existingTeacher.length) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giáo viên",
        });
      }

      // SAU ĐÓ mới validate input
      if (
        !hoTen ||
        !CCCD ||
        !diaChi ||
        !chuyenMon ||
        !chucVu ||
        !SDT ||
        !email
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        });
      }

      // Cập nhật thông tin giáo viên
      const [result] = await pool.execute(
        `UPDATE giaovien SET hoTen = ?, CCCD = ?, diaChi = ?, chuyenMon = ?, chucVu = ?, SDT = ?, email = ?
         WHERE maGV = ?`,
        [hoTen, CCCD, diaChi, chuyenMon, chucVu, SDT, email, maGV]
      );

      // Cập nhật loại tài khoản nếu chức vụ thay đổi
      const newLoaiTaiKhoan = chucVu === "GVCN" ? "gvcn" : "giaovien";
      await pool.execute(
        "UPDATE taikhoan SET loaiTaiKhoan = ? WHERE maTaiKhoan = ?",
        [newLoaiTaiKhoan, existingTeacher[0].maTaiKhoan]
      );

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: "Cập nhật thông tin giáo viên thành công",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Không thể cập nhật thông tin",
        });
      }
    } catch (error) {
      console.error("Lỗi cập nhật giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Xóa giáo viên (chỉ giáo vụ và ban giám hiệu) - chỉ thay đổi trạng thái nghỉ làm
  static async deleteTeacher(req, res) {
    try {
      const { maGV } = req.params;
      const { loaiTaiKhoan: userRole } = req.user;

      // Chỉ giáo vụ và ban giám hiệu mới có quyền "xóa"
      if (userRole !== "giaovu" && userRole !== "bangiamhieu") {
        return res.status(403).json({
          success: false,
          message:
            "Chỉ giáo vụ và ban giám hiệu mới có quyền nghỉ việc giáo viên",
        });
      }

      // Cập nhật trạng thái thành nghỉ làm (0) thay vì xóa khỏi database
      const [result] = await pool.execute(
        "UPDATE giaovien SET trangThai = 0, ngayKetThuc = NOW() WHERE maGV = ? AND trangThai = 1",
        [maGV]
      );

      if (result.affectedRows > 0) {
        // Vô hiệu hóa tài khoản (có thể kích hoạt lại sau)
        const [teacher] = await pool.execute(
          "SELECT maTaiKhoan FROM giaovien WHERE maGV = ?",
          [maGV]
        );
        if (teacher.length > 0) {
          // Có thể thêm trạng thái inactive cho tài khoản thay vì xóa
          await pool.execute(
            "UPDATE taikhoan SET isActive = 0 WHERE maTaiKhoan = ?",
            [teacher[0].maTaiKhoan]
          );
        }

        res.json({
          success: true,
          message: "Đã cập nhật trạng thái giáo viên thành nghỉ việc",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy giáo viên hoặc giáo viên đã nghỉ việc",
        });
      }
    } catch (error) {
      console.error("Lỗi nghỉ việc giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Lấy danh sách giáo viên (tất cả có thể xem, phân quyền trong query)
  static async getTeachers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        chuyenMon,
        chucVu,
        search,
        showInactive = false,
      } = req.query;
      const { loaiTaiKhoan: userRole } = req.user;
      const offset = (page - 1) * limit;

      // Chỉ giáo vụ mới được xem giáo viên đã nghỉ việc
      let whereClause = "WHERE 1=1";
      let params = [];

      if (userRole === "giaovu" && showInactive === "true") {
        // Giáo vụ có thể xem tất cả (bao gồm đã nghỉ việc)
      } else {
        // Những người khác chỉ xem giáo viên đang làm việc
        whereClause += " AND gv.trangThai = 1";
      }

      if (chuyenMon) {
        whereClause += " AND gv.chuyenMon = ?";
        params.push(chuyenMon);
      }

      if (chucVu) {
        whereClause += " AND gv.chucVu = ?";
        params.push(chucVu);
      }

      if (search) {
        whereClause += " AND gv.hoTen LIKE ?";
        params.push(`%${search}%`);
      }

      const query = `
        SELECT gv.*, tk.tenDangNhap, tk.isDefaultPassword,
               CASE WHEN gv.trangThai = 1 THEN 'Đang làm việc' ELSE 'Đã nghỉ việc' END as trangThaiText
        FROM giaovien gv
        LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
        ${whereClause}
        ORDER BY gv.trangThai DESC, gv.hoTen
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), offset);
      const [rows] = await pool.execute(query, params);

      // Đếm tổng số
      const countQuery = `SELECT COUNT(*) as total FROM giaovien gv ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, params.slice(0, -2));

      res.json({
        success: true,
        data: {
          teachers: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Tái kích hoạt giáo viên (chỉ giáo vụ)
  static async reactivateTeacher(req, res) {
    try {
      const { maGV } = req.params;
      const { loaiTaiKhoan: userRole } = req.user;

      if (userRole !== "giaovu") {
        return res.status(403).json({
          success: false,
          message: "Chỉ giáo vụ mới có quyền tái kích hoạt giáo viên",
        });
      }

      const [result] = await pool.execute(
        "UPDATE giaovien SET trangThai = 1, ngayKetThuc = NULL WHERE maGV = ?",
        [maGV]
      );

      if (result.affectedRows > 0) {
        // Kích hoạt lại tài khoản
        const [teacher] = await pool.execute(
          "SELECT maTaiKhoan FROM giaovien WHERE maGV = ?",
          [maGV]
        );
        if (teacher.length > 0) {
          await pool.execute(
            "UPDATE taikhoan SET isActive = 1 WHERE maTaiKhoan = ?",
            [teacher[0].maTaiKhoan]
          );
        }

        res.json({
          success: true,
          message: "Tái kích hoạt giáo viên thành công",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy giáo viên",
        });
      }
    } catch (error) {
      console.error("Lỗi tái kích hoạt giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }

  // Tạo mã giáo viên tự động
  static async generateTeacherId() {
    try {
      const [rows] = await pool.execute(
        "SELECT maGV FROM giaovien ORDER BY maGV DESC LIMIT 1"
      );

      if (rows.length === 0) {
        return "GV001";
      }

      const lastId = rows[0].maGV;
      const num = parseInt(lastId.slice(2)) + 1;
      return "GV" + num.toString().padStart(3, "0");
    } catch (error) {
      throw new Error("Lỗi tạo mã giáo viên: " + error.message);
    }
  }

  // Lấy thông tin giáo viên theo ID
  static async getTeacherById(req, res) {
    try {
      const { maGV } = req.params;

      const [rows] = await pool.execute(
        `SELECT gv.*, tk.tenDangNhap, tk.isDefaultPassword,
                CASE WHEN gv.trangThai = 1 THEN 'Đang làm việc' ELSE 'Đã nghỉ việc' END as trangThaiText
         FROM giaovien gv
         LEFT JOIN taikhoan tk ON gv.maTaiKhoan = tk.maTaiKhoan
         WHERE gv.maGV = ?`,
        [maGV]
      );

      if (rows.length > 0) {
        res.json({
          success: true,
          data: rows[0],
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy giáo viên",
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin giáo viên:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  }
}

module.exports = TeacherController;
