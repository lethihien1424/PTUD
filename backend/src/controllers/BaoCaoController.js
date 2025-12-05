const ReportModel = require('../models/BaoCaoModel');

class ReportController {
    //Xử lý yêu cầu Báo cáo Sĩ số
    static async getAttendanceReport(req, res) {
        try {
            const { month } = req.query;
            const data = await ReportModel.getAttendanceReport(month);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xử lý yêu cầu Báo cáo Hạnh kiểm
    static async getConductReport(req, res) {
        try {
            const { grade } = req.query;
            const data = await ReportModel.getConductReport(grade);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }


    //Xử lý yêu cầu Báo cáo Điểm số
    static async getGradeReport(req, res) {
        try {
            const { class: classCode, subject, semester } = req.query;
            const data = await ReportModel.getGradeReport(classCode, subject, semester);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    //Xử lý yêu cầu Báo cáo Kết quả Học tập
    static async getAcademicResultsReport(req, res) {
        try {
            const { grade } = req.query;
            const data = await ReportModel.getAcademicResultsReport(grade);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ReportController;