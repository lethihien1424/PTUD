const express = require("express");
const router = express.Router();

const tuyenSinhController = require("../controllers/TuyenSinhController"); 


// ✅ Nhập chỉ tiêu tuyển sinh
router.post("/chitieu", tuyenSinhController.nhapChiTieu);

// ✅ Nhập điểm thi tuyển sinh
router.post("/diemthi", tuyenSinhController.nhapDiemThi);


// SỬ DỤNG HÀM XÉT TUYỂN 
router.post("/xettuyen", tuyenSinhController.runGlobalAdmissions); 

//  Chạy xét tuyển toàn cục theo 3 giai đoạn 
router.post('/admissions/runGlobal', tuyenSinhController.runGlobalAdmissions);


module.exports = router;