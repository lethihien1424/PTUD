const GradeRequestModel = require('../models/PhieuSuaDiemModel');

class GradeRequestController {
    //Lấy tất cả phiếu sửa điểm
    static async getAllRequests(req, res) {
        try {
            const requests = await GradeRequestModel.findAll();
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xử lý DUYỆT phiếu
    static async approveRequest(req, res) {
        const { id } = req.params; // id là maPhieu
        try {
            await GradeRequestModel.updateStatus(id, 'Đã duyệt');
            
            // (TODO: Gửi thông báo cho giáo viên)
            
            res.status(200).json({ 
                success: true, 
                message: "Duyệt phiếu thành công." 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xử lý TỪ CHỐI phiếu (Được gọi khi BGH nhấn nút "Từ chối")
    static async rejectRequest(req, res) {
        const { id } = req.params; // id là maPhieu
        try {
            await GradeRequestModel.updateStatus(id, 'Từ chối');

            // (TODO: Gửi thông báo cho giáo viên)
            
            res.status(200).json({ 
                success: true, 
                message: "Từ chối phiếu thành công." 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = GradeRequestController;