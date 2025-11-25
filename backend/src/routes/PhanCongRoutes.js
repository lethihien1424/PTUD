const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/PhanCongController');


// 1. IMPORT MIDDLEWARE XÁC THỰC VÀ PHÂN QUYỀN
const { authenticateToken, authorizeRoles } = require('../middlewares/auth'); 


// 2. ÁP DỤNG MIDDLEWARE CHO TẤT CẢ CÁC ROUTE TRONG FILE NÀY
router.use(authenticateToken); 
router.use(authorizeRoles('bangiamhieu')); 

router.get('/data', assignmentController.getAssignmentData);
router.get('/teachers', assignmentController.getTeachersDetails);
router.post('/', assignmentController.createAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;