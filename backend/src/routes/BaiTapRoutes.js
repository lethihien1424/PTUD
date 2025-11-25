const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const baiTapController = require("../controllers/LamBaiTapController");

// Import middleware xác thực của bạn (từ file auth.js)
// Giả sử file auth.js export ra hàm 'authenticateToken'
const { authenticateToken } = require("../middlewares/auth"); 

// --- Cấu hình Multer để upload file bài làm ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Bạn cần tạo thư mục 'uploads/bailam' ở thư mục gốc
    cb(null, "uploads/bailam/"); 
  },
  filename: (req, file, cb) => {
    // Đặt tên file (để tránh trùng lặp), dùng maTaiKhoan từ token
    cb(null, `${req.user.maTaiKhoan}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Lọc file (chỉ cho phép 1 số định dạng)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|zip|rar|jpg|png|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("File không đúng định dạng cho phép."), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  fileFilter: fileFilter
});
// ----------------------------------------------


/* * Áp dụng middleware xác thực (authenticateToken) cho TẤT CẢ các route bên dưới.
 * Tất cả các route này sẽ được bảo vệ, và có req.user chứa maHocSinh, maLop
 */
router.use(authenticateToken); 

// Flow 1: Lấy danh sách Môn học của học sinh
router.get("/monhoc", baiTapController.getMonHocList);

// Flow 2: Lấy danh sách Bài tập từ Môn học
router.get("/monhoc/:maMonHoc", baiTapController.getBaiTapListByMon);

// Flow 4 & 5: Lấy chi tiết 1 bài tập (kiểm tra hạn, lấy câu hỏi)
router.get("/:maBaiTap", baiTapController.getBaiTapDetail);

// Flow 6-9 & Alt 5: Nộp bài (Trắc nghiệm hoặc Tự luận)
// 'upload.single' sẽ xử lý file upload có name là 'fileBaiLam'
router.post(
  "/:maBaiTap/nopbai", 
  upload.single('fileBaiLam'), 
  baiTapController.submitBaiLam
);

module.exports = router;