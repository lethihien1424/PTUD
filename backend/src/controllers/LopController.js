const ClassModel = require('../models/LopModel');
const TeacherModel = require('../models/GiaoVienModel');

class ClassController {
    //Lấy tất cả lớp học
    static async getAllClasses(req, res) {
        try {
            const classes = await ClassModel.findAll();
            res.status(200).json({ success: true, data: classes });
        } catch (error) {
            console.error("Lỗi Controller (getAllClasses):", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Lấy danh sách giáo viên
    static async getSupportData(req, res) {
        try {
            // Dùng lại teacherModel của Hiền để lấy danh sách GV
            const teachers = await TeacherModel.getAllTeachers(); 
            res.status(200).json({ success: true, data: { teachers } });
        } catch (error) {
            console.error("Lỗi Controller (getSupportData):", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }


    //Tạo lớp mới
    static async createClass(req, res) {
        // Giao diện React gửi 3 trường này
        const { khoi, maGVChuNhiem, siSo } = req.body;
        
        if (!khoi || !maGVChuNhiem || !siSo) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc (khối, gvcn, sĩ số)." });
        }

        try {
            // Logic tạo tên lớp tự động 
            const classCount = await ClassModel.countByGrade(khoi);
            const tenLop = `${khoi}A${classCount + 1}`;
            // Tạm dùng tenLop làm maLop (Bạn có thể thay đổi logic này)
            const maLop = `${khoi}A${classCount + 1}`; 

            const classData = {
                maLop,
                tenLop,
                khoi,
                siSo: parseInt(siSo),
                maGVChuNhiem,
                maTruong: 'T001' // Giả định mã trường (CSDL yêu cầu)
            };

            await ClassModel.create(classData);
            
            res.status(201).json({ 
                success: true, 
                message: "Tạo lớp thành công.",
                data: { maLop, tenLop } 
            });
            
        } catch (error) {
            console.error("Lỗi Controller (createClass):", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    
    //Cập nhật lớp
    static async updateClass(req, res) {
        const { id } = req.params; // id là maLop
        // Giao diện React chỉ cho cập nhật GVCN và Sĩ số
        const { maGVChuNhiem, siSo } = req.body;

        if (!maGVChuNhiem || !siSo) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin (gvcn, sĩ số)." });
        }

        try {
            const success = await ClassModel.update(id, { maGVChuNhiem, siSo: parseInt(siSo) });
            if (!success) {
                return res.status(404).json({ success: false, message: "Không tìm thấy lớp để cập nhật." });
            }
            res.status(200).json({ success: true, message: "Cập nhật lớp thành công." });
        } catch (error) {
            console.error("Lỗi Controller (updateClass):", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xóa lớp
    static async deleteClass(req, res) {
        const { id } = req.params; // id là maLop
        try {
            const success = await ClassModel.delete(id);
            if (!success) {
                return res.status(404).json({ success: false, message: "Không tìm thấy lớp để xóa." });
            }
            res.status(200).json({ success: true, message: "Xóa lớp thành công." });
        } catch (error) {
            console.error("Lỗi Controller (deleteClass):", error);
            // Xử lý lỗi Khóa ngoại (nếu lớp còn học sinh)
            if (error.message.includes("vẫn còn học sinh")) {
                return res.status(409).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ClassController;