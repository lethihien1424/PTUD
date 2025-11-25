const { pool } = require('../config/db');

class ReportModel {
    //Lấy dữ liệu Báo cáo Sĩ số (AttendanceReport.tsx), Tổng hợp dữ liệu từ 'kqdiemdanh' (điểm danh) và 'donvanghoc' (đơn vắng)
    static async getAttendanceReport() {
        try {
            // 1. Lấy Thống kê Thẻ (Summary Cards)
            const [[stats]] = await pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM hocsinh WHERE tinhTrang = 'Đang học') AS totalStudents,
                    (SELECT COUNT(*) FROM kqdiemdanh WHERE trangThai = 'Vắng') AS totalAbsent,
                    (SELECT COUNT(*) FROM kqdiemdanh WHERE trangThai = 'Có phép') AS totalPermitted
            `);

            // 2. Lấy Xu hướng theo tháng (Line Chart)
            const [monthlyAttendance] = await pool.query(`
                SELECT 
                    MONTH(thoiGian) AS month,
                    COUNT(CASE WHEN trangThai = 'Có mặt' THEN 1 END) AS present,
                    COUNT(CASE WHEN trangThai != 'Có mặt' THEN 1 END) AS absent
                FROM kqdiemdanh
                GROUP BY MONTH(thoiGian)
                ORDER BY MONTH(thoiGian)
            `);

            // 3. Lấy Sĩ số theo Lớp (Bar Chart & Table)
            const [classAttendance] = await pool.query(`
                SELECT 
                    l.tenLop AS class,
                    l.siSo AS total,
                    COUNT(CASE WHEN kd.trangThai = 'Có mặt' THEN 1 END) AS present,
                    COUNT(CASE WHEN kd.trangThai != 'Có mặt' THEN 1 END) AS absent
                FROM lop l
                LEFT JOIN kqdiemdanh kd ON l.maLop = kd.maLop
                GROUP BY l.maLop
            `);

            // 4. Lấy Lý do vắng (Từ bảng donvanghoc)
            const [absentReasons] = await pool.query(`
                SELECT 
                    lyDo AS reason,
                    COUNT(*) AS count
                FROM donvanghoc
                WHERE trangThai = 'Đã duyệt'
                GROUP BY lyDo
            `);

            return { stats, monthlyAttendance, classAttendance, absentReasons };

        } catch (error) {
            throw new Error("Lỗi Model khi lấy Báo cáo Sĩ số: " + error.message);
        }
    }

    //Lấy dữ liệu Báo cáo Hạnh kiểm (ConductReport.tsx). Tổng hợp dữ liệu từ 'phieudanhgiahanhkiem'
    static async getConductReport() {
        try {
            // 1. Lấy Tỷ lệ chung (Pie Chart)
            const [conductData] = await pool.query(`
                SELECT 
                    loaiHanhKiem AS name,
                    COUNT(*) AS value
                FROM phieudanhgiahanhkiem
                GROUP BY loaiHanhKiem
            `);
            
            // 2. Lấy Hạnh kiểm theo Lớp (Stacked Bar Chart)
            const [classData] = await pool.query(`
                SELECT 
                    l.tenLop AS class,
                    COUNT(CASE WHEN p.loaiHanhKiem = 'Giỏi' THEN 1 END) AS tot,
                    COUNT(CASE WHEN p.loaiHanhKiem = 'Khá' THEN 1 END) AS kha,
                    COUNT(CASE WHEN p.loaiHanhKiem = 'Trung bình' THEN 1 END) AS tb,
                    COUNT(CASE WHEN p.loaiHanhKiem = 'Yếu' THEN 1 END) AS yeu
                FROM phieudanhgiahanhkiem p
                JOIN hocsinh hs ON p.maHocSInh = hs.maHocSinh
                JOIN lop l ON hs.maLop = l.maLop
                GROUP BY l.maLop
            `);

            return { conductData, classData };

        } catch (error) {
            throw new Error("Lỗi Model khi lấy Báo cáo Hạnh kiểm: " + error.message);
        }
    }

    //Lấy dữ liệu Báo cáo Điểm số (GradeReport.tsx). Tổng hợp dữ liệu từ bảng 'diem'
    static async getGradeReport() {
        try {
            // 1. Phân bố điểm (Bar Chart)
            const [[gradeData]] = await pool.query(`
                SELECT 
                    SUM(CASE WHEN diemTK < 2 THEN 1 ELSE 0 END) AS '0-2',
                    SUM(CASE WHEN diemTK >= 2 AND diemTK < 4 THEN 1 ELSE 0 END) AS '2-4',
                    SUM(CASE WHEN diemTK >= 4 AND diemTK < 5 THEN 1 ELSE 0 END) AS '4-5',
                    SUM(CASE WHEN diemTK >= 5 AND diemTK < 6.5 THEN 1 ELSE 0 END) AS '5-6.5',
                    SUM(CASE WHEN diemTK >= 6.5 AND diemTK < 8 THEN 1 ELSE 0 END) AS '6.5-8',
                    SUM(CASE WHEN diemTK >= 8 THEN 1 ELSE 0 END) AS '8-10'
                FROM diem
            `);

            // 2. Kết quả theo môn (Bar Chart)
            const [subjectData] = await pool.query(`
                SELECT 
                    mh.tenMonHoc AS subject,
                    AVG(d.diemTK) AS average,
                    SUM(CASE WHEN d.diemTK >= 8 THEN 1 ELSE 0 END) AS excellent,
                    SUM(CASE WHEN d.diemTK >= 6.5 AND d.diemTK < 8 THEN 1 ELSE 0 END) AS good,
                    SUM(CASE WHEN d.diemTK >= 5 AND d.diemTK < 6.5 THEN 1 ELSE 0 END) AS average_count,
                    SUM(CASE WHEN d.diemTK < 5 THEN 1 ELSE 0 END) AS weak
                FROM diem d
                JOIN monhoc mh ON d.maMonHoc = mh.maMonHoc
                GROUP BY d.maMonHoc
            `);

            return { gradeData: Object.entries(gradeData).map(([range, count]) => ({ range, count })), 
                     subjectData };

        } catch (error) {
            throw new Error("Lỗi Model khi lấy Báo cáo Điểm số: " + error.message);
        }
    }

    //Lấy dữ liệu Báo cáo Kết quả Học tập (AcademicResultsReport.tsx). Tổng hợp xếp loại (Giỏi, Khá, TB, Yếu)
    static async getAcademicResultsReport() {
        try {
            // (Giả định 'diemTK' là điểm trung bình học kỳ/năm)
            // 1. Xếp loại chung (Pie Chart)
            const [[classificationData]] = await pool.query(`
                SELECT
                    SUM(CASE WHEN diemTK >= 8.0 THEN 1 ELSE 0 END) AS gioi,
                    SUM(CASE WHEN diemTK >= 6.5 AND diemTK < 8.0 THEN 1 ELSE 0 END) AS kha,
                    SUM(CASE WHEN diemTK >= 5.0 AND diemTK < 6.5 THEN 1 ELSE 0 END) AS trungbinh,
                    SUM(CASE WHEN diemTK < 5.0 THEN 1 ELSE 0 END) AS yeu
                FROM (
                    SELECT AVG(diemTK) as diemTK 
                    FROM diem 
                    GROUP BY maHocSinh
                ) AS hocsinh_avg
            `);

            // 2. So sánh theo khối (Bar Chart)
            const [gradeComparison] = await pool.query(`
                SELECT 
                    l.khoi AS grade,
                    SUM(CASE WHEN d.diemTK >= 8.0 THEN 1 ELSE 0 END) AS gioi,
                    SUM(CASE WHEN d.diemTK >= 6.5 AND d.diemTK < 8.0 THEN 1 ELSE 0 END) AS kha,
                    SUM(CASE WHEN d.diemTK >= 5.0 AND d.diemTK < 6.5 THEN 1 ELSE 0 END) AS tb,
                    SUM(CASE WHEN d.diemTK < 5.0 THEN 1 ELSE 0 END) AS yeu
                FROM diem d
                JOIN hocsinh hs ON d.maHocSinh = hs.maHocSinh
                JOIN lop l ON hs.maLop = l.maLop
                GROUP BY l.khoi
            `);

            return { 
                classificationData: [
                    { name: 'Giỏi', value: classificationData.gioi },
                    { name: 'Khá', value: classificationData.kha },
                    { name: 'Trung bình', value: classificationData.trungbinh },
                    { name: 'Yếu', value: classificationData.yeu }
                ], 
                gradeComparison 
            };

        } catch (error) {
            throw new Error("Lỗi Model khi lấy Báo cáo Học tập: " + error.message);
        }
    }
}

module.exports = ReportModel;