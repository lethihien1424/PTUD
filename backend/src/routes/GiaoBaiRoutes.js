const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const giaoBaiTapController = require("../controllers/GiaoBaiTapController");
const { authenticateToken } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu vào thư mục 'uploads/debai/'
    cb(null, "uploads/debai/"); 
  },
  filename: (req, file, cb) => {
    // Đặt tên file (GV + thời gian)
    cb(null, `${req.user.maGiaoVien}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

router.use(authenticateToken);

router.get("/lop-day", giaoBaiTapController.getLopDayList);

router.post("/trac-nghiem", giaoBaiTapController.createBaiTapTracNghiem);

router.post(
  "/tu-luan", 
  upload.single('fileHuongDan'), // 'fileHuongDan' là tên trường (field)
  giaoBaiTapController.createBaiTapTuLuan
);

module.exports = router;