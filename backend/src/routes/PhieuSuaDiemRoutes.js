const express = require('express');
const router = express.Router();
const GradeRequestController = require('../controllers/PhieuSuaDiemController');

// 1. IMPORT MIDDLEWARE XÁC THỰC VÀ PHÂN QUYỀN
const { 
    authenticateToken, 
    authorizeRoles 
} = require('../middlewares/auth'); 


// 2. ÁP DỤNG MIDDLEWARE CHO TẤT CẢ CÁC ROUTE TRONG FILE NÀY
router.use(authenticateToken); 
router.use(authorizeRoles('bangiamhieu')); 


router.get('/', GradeRequestController.getAllRequests);
router.put('/:id/approve', GradeRequestController.approveRequest);
router.put('/:id/reject', GradeRequestController.rejectRequest);

module.exports = router;