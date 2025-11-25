// backend/src/routes/classRoute.js
const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/LopController');

// 1. IMPORT MIDDLEWARE XÁC THỰC VÀ PHÂN QUYỀN
const { 
    authenticateToken, 
    authorizeRoles 
} = require('../middlewares/auth'); 


// 2. ÁP DỤNG MIDDLEWARE CHO TẤT CẢ CÁC ROUTE TRONG FILE NÀY
router.use(authenticateToken); 
router.use(authorizeRoles('giaovu', 'bangiamhieu')); 


router.get('/support-data', ClassController.getSupportData);
router.get('/', ClassController.getAllClasses);
router.post('/', ClassController.createClass);
router.put('/:id', ClassController.updateClass);
router.delete('/:id', ClassController.deleteClass);

module.exports = router;