const AssignmentModel = require('../models/PhanCongModel');

//Hàm tạo ID Phân Công (Helper)
function generateAssignmentId() {
    return `PC${Date.now().toString().slice(-8)}`; 
}

class AssignmentController {
    // 1. Lấy dữ liệu cho bảng Phân công
    static async getAssignmentData(req, res) {
        try {
            // Gọi method static từ Model
            const data = await AssignmentModel.getAssignmentTableData();
            res.status(200).json(data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu bảng phân công:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu phân công' });
        }
    }

    // 2. Lấy danh sách Giáo viên Chi tiết
    static async getTeachersDetails(req, res) {
        try {
            const teachers = await AssignmentModel.getDetailedTeachers();
            res.status(200).json(teachers);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết giáo viên:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy chi tiết giáo viên' });
        }
    }

    // 3. Tạo Phân công mới
    static async createAssignment(req, res) {
        const { maGV, maLop, maMonHoc } = req.body;

        if (!maGV || !maLop || !maMonHoc) {
            return res.status(400).json({ message: 'Thiếu mã Giáo viên, Lớp, hoặc Môn học.' });
        }

        try {
            // KIỂM TRA TRÙNG LẶP (Logic: GV này đã dạy môn này lớp này chưa)
            const existingAssignment = await AssignmentModel.findAssignmentByDetails(maGV, maLop, maMonHoc);
            
            if (existingAssignment) {
                return res.status(409).json({ message: 'Giáo viên này đã được phân công môn này cho lớp này.' });
            }
            
            // Lưu ý: Nếu bạn muốn chặn việc "1 lớp 1 môn có 2 GV khác nhau", 
            // bạn cần viết thêm hàm check trong Model chỉ dựa trên (maLop, maMonHoc).

            const maPhanCong = generateAssignmentId();

            await AssignmentModel.createAssignment(maPhanCong, maGV, maLop, maMonHoc);

            res.status(201).json({
                message: 'Phân công thành công!',
                maPhanCong: maPhanCong
            });

        } catch (error) {
            console.error('Lỗi khi tạo phân công:', error);
            res.status(500).json({ message: 'Lỗi server nội bộ khi tạo phân công.' });
        }
    }

    // 4. Xóa Phân công
    static async deleteAssignment(req, res) {
        const { id } = req.params; // id là maPhanCong

        try {
            const result = await AssignmentModel.deleteAssignment(id);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy phân công để xóa.' });
            }

            res.status(200).json({ message: 'Xóa phân công thành công.' });
        } catch (error) {
            console.error('Lỗi khi xóa phân công:', error);
            res.status(500).json({ message: 'Lỗi server nội bộ khi xóa phân công.' });
        }
    }
}

module.exports = AssignmentController;