const { pool } = require('../config/db');

const SUBJECT_HOURS = {
    'Văn': 4, 'Toán': 4, 'Tiếng Anh': 3, 'Vật lý': 2, 'Hóa học': 2,
    'Sinh học': 2, 'Lịch sử': 2, 'Địa lý': 2, 'GDCD': 1, 'Tin học': 1,
    'Công nghệ': 1, 'GDQP-AN': 1, 'Giáo dục thể chất': 2,
    'Hoạt động trải nghiệm': 1, 'Giáo dục địa phương': 1
};
const MAX_HOURS = 20;

class AssignmentModel {
    //1. Lấy thông tin chi tiết của tất cả giáo viên
    static async getDetailedTeachers() {
        try {
            const [teachersRaw] = await pool.query(
                `SELECT maGV, hoTen, chuyenMon FROM giaovien WHERE trangThai = 1`
            );

            const [assignments] = await pool.query(`
                SELECT pc.maGV, mh.tenMonHoc, l.khoi
                FROM bangphancong pc
                JOIN monhoc mh ON pc.maMonHoc = mh.maMonHoc
                JOIN lop l ON pc.maLop = l.maLop
            `);

            const detailedTeachers = teachersRaw.map(t => {
                let currentHours = 0;
                const currentGrades = new Set();
                
                const teacherAssignments = assignments.filter(a => a.maGV === t.maGV);

                teacherAssignments.forEach(a => {
                    const subjectName = a.tenMonHoc ? a.tenMonHoc.trim() : '';
                    currentHours += SUBJECT_HOURS[subjectName] || 0; 
                    
                    const grade = parseInt(a.khoi);
                    if (!isNaN(grade) && grade > 0) {
                        currentGrades.add(grade);
                    }
                });

                return {
                    id: t.maGV,
                    name: t.hoTen,
                    specialization: t.chuyenMon ? t.chuyenMon.split(',').map(s => s.trim()) : [], 
                    currentHours: currentHours,
                    maxHours: MAX_HOURS,
                    currentGrades: Array.from(currentGrades),
                };
            });

            return detailedTeachers;
        } catch (error) {
            console.error("Lỗi trong getDetailedTeachers:", error.message);
            throw new Error("Lỗi khi lấy chi tiết giáo viên: " + error.message);
        }
    }

    //2. Lấy dữ liệu cho Bảng Phân Công chính
    static async getAssignmentTableData() {
        try {
            const sql = `
                SELECT
                    l.maLop AS classId, l.tenLop AS className, l.khoi AS grade,
                    mh.maMonHoc AS subjectId, mh.tenMonHoc AS subjectName,
                    pc.maPhanCong,
                    gv.maGV AS teacherId, gv.hoTen AS teacherName, gv.chuyenMon
                FROM lop l
                JOIN monhoc mh ON mh.khoiApDung = l.khoi
                LEFT JOIN bangphancong pc ON pc.maLop = l.maLop AND pc.maMonHoc = mh.maMonHoc
                LEFT JOIN giaovien gv ON pc.maGV = gv.maGV
                ORDER BY l.tenLop, mh.tenMonHoc;
            `;
            
            const [rawData] = await pool.query(sql);

            const classesMap = new Map();
            for (const row of rawData) {
                if (!classesMap.has(row.classId)) {
                    classesMap.set(row.classId, {
                        id: row.classId,
                        name: row.className,
                        grade: parseInt(row.grade),
                        subjects: []
                    });
                }
                let assignedTeacher = null;
                if (row.teacherId) {
                    const currentHours = rawData
                        .filter(r => r.teacherId === row.teacherId && r.subjectName)
                        .reduce((sum, r) => sum + (SUBJECT_HOURS[r.subjectName.trim()] || 0), 0);
                    assignedTeacher = {
                        id: row.teacherId,
                        name: row.teacherName,
                        currentHours: currentHours,
                        maxHours: MAX_HOURS,
                    };
                }
                classesMap.get(row.classId).subjects.push({
                    id: row.subjectId,
                    name: row.subjectName,
                    assignedTeacher: assignedTeacher
                });
            }
            return Array.from(classesMap.values());
        } catch (error) {
            console.error("Lỗi trong getAssignmentTableData:", error.message);
            throw new Error("Lỗi khi lấy dữ liệu bảng phân công: " + error.message);
        }
    }

    //3. Kiểm tra phân công trùng lặp
    static async findAssignmentByDetails(maGV, maLop, maMonHoc) {
        try {
            const sql = `
                SELECT maPhanCong FROM bangphancong
                WHERE maGV = ? AND maLop = ? AND maMonHoc = ?
            `;
            const [result] = await pool.execute(sql, [maGV, maLop, maMonHoc]);
            return result[0]; 
        } catch (error) {
            throw new Error("Lỗi khi kiểm tra phân công: " + error.message);
        }
    }

    //4. Tạo phân công mới
    static async createAssignment(maPhanCong, maGV, maLop, maMonHoc) {
        try {
            const sql = `
                INSERT INTO bangphancong (maPhanCong, maGV, maLop, maMonHoc, ngayPhanCong, trangThai)
                VALUES (?, ?, ?, ?, CURDATE(), 'Đã phân công')
            `;
            const params = [maPhanCong, maGV, maLop, maMonHoc];
            const [result] = await pool.execute(sql, params);
            return result;
        } catch (error) {
            throw new Error("Lỗi khi tạo phân công: " + error.message);
        }
    }

    //5. Xóa phân công
    static async deleteAssignment(maPhanCong) {
        try {
            const sql = `DELETE FROM bangphancong WHERE maPhanCong = ?`;
            const [result] = await pool.execute(sql, [maPhanCong]);
            return result;
        } catch (error) {
            throw new Error("Lỗi khi xóa phân công: " + error.message);
        }
    }
    static async getAssignmentsByTeacher(maGV, maHocKy) {
    let hocKyCondition = "";
    const params = [maGV];

    if (maHocKy) {
      hocKyCondition = `
        AND EXISTS (
          SELECT 1 
          FROM diem d
          JOIN hocsinh hs ON hs.maHocSinh = d.maHocSinh
          WHERE d.maMonHoc = bpc.maMonHoc
            AND d.maHocKy = ?
            AND hs.maLop = bpc.maLop
        )
      `;
      params.push(maHocKy);
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        bpc.maMonHoc,
        mh.tenMonHoc,
        bpc.maLop,
        l.tenLop,
        mh.khoiApDung AS khoi
      FROM bangphancong bpc
      JOIN monhoc mh ON mh.maMonHoc = bpc.maMonHoc
      JOIN lop l ON l.maLop = bpc.maLop
      WHERE bpc.maGV = ?
      ${hocKyCondition}
      ORDER BY bpc.maLop, bpc.maMonHoc
    `,
      params
    );

    return rows;
  }

  // Kiểm tra giáo viên có phụ trách lớp & môn cụ thể không
  static async isTeacherAssigned(maGV, maLop, maMonHoc) {
    const [rows] = await pool.execute(
      `SELECT maPhanCong 
       FROM bangphancong 
       WHERE maGV = ? AND maLop = ? AND maMonHoc = ?
       LIMIT 1`,
      [maGV, maLop, maMonHoc]
    );
    return rows.length > 0;
  }
}

module.exports = AssignmentModel;