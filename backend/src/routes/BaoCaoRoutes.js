// backend/src/routes/reportRoute.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/BaoCaoController');

// 1. IMPORT MIDDLEWARE XÁC THỰC VÀ PHÂN QUYỀN
const { 
    authenticateToken, 
    authorizeRoles 
} = require('../middlewares/auth'); 


// 2. ÁP DỤNG MIDDLEWARE CHO TẤT CẢ CÁC ROUTE TRONG FILE NÀY
router.use(authenticateToken); 
router.use(authorizeRoles('bangiamhieu')); 


router.get('/attendance', /*authenticateToken, isBGH,*/ ReportController.getAttendanceReport);
router.get('/conduct', /*authenticateToken, isBGH,*/ ReportController.getConductReport);
router.get('/grade', /*authenticateToken, isBGH,*/ ReportController.getGradeReport);
router.get('/academic', /*authenticateToken, isBGH,*/ ReportController.getAcademicResultsReport);


module.exports = router;