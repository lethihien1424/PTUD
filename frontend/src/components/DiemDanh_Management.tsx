import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import toast, { Toaster } from 'react-hot-toast';

interface StudentAttendance {
  studentId: string;
  fullName: string;
  class: string;
  attendance: 'present' | 'absent-excused' | 'absent-unexcused';
  note?: string;
}

interface AttendanceManagementProps {
  classId: string;
  onBack: () => void;
  onAttendanceComplete: (classId: string) => void;
  selectedDate?: string;
}

interface AbsentModalData {
  studentId: string;
  studentName: string;
  type: 'absent-excused' | 'absent-unexcused';
  reason: string;
  note: string;
}

export function AttendanceManagement({ classId, onBack, onAttendanceComplete, selectedDate: propSelectedDate }: AttendanceManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(propSelectedDate || new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentModalData, setAbsentModalData] = useState<AbsentModalData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmTime, setConfirmTime] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalStudents, setOriginalStudents] = useState<StudentAttendance[]>([]);
  const [classInfo, setClassInfo] = useState<{ name: string; teacher: string }>({ 
    name: classId.toUpperCase(), 
    teacher: 'Đang tải...' 
  });

  // Load class info from API
  useEffect(() => {
    async function loadClassInfo() {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = 'http://localhost:3000/api/attendance/classes/all';
        
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const result = await res.json();
          const classes = result.data || [];
          const foundClass = classes.find((c: any) => c.maLop === classId);
          
          if (foundClass) {
            setClassInfo({
              name: foundClass.tenLop || classId.toUpperCase(),
              teacher: foundClass.tenGiaoVienChuNhiem || 'Chưa phân công'
            });
            console.log('✅ Class info loaded:', foundClass);
          }
        }
      } catch (error) {
        console.error('❌ Error loading class info:', error);
      }
    }
    
    loadClassInfo();
  }, [classId]);

  // Check if this class has been confirmed for the selected date
  const checkIfClassConfirmed = (classId: string, date: string) => {
    const confirmedKey = `${classId}-${date}`;
    const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
    
    if (confirmedClasses[confirmedKey]) {
      const data = confirmedClasses[confirmedKey];
      
      if (typeof data === 'boolean' || !data.confirmTime) {
        return { isConfirmed: false, confirmTime: null };
      }
      
      return {
        isConfirmed: true,
        confirmTime: data.confirmTime
      };
    }
    
    return { isConfirmed: false, confirmTime: null };
  };

  // Save confirmation status with timestamp
  const saveConfirmationStatus = (classId: string, date: string) => {
    const confirmedKey = `${classId}-${date}`;
    const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
    
    const confirmData = {
      confirmed: true,
      confirmTime: new Date().toISOString()
    };
    
    confirmedClasses[confirmedKey] = confirmData;
    localStorage.setItem('confirmedAttendance', JSON.stringify(confirmedClasses));
  };

  // Load students and attendance data
  useEffect(() => {
    setStudents([]);
    setOriginalStudents([]);
    setHasChanges(false);
    setSearchTerm('');
    setShowAbsentModal(false);
    setAbsentModalData(null);
    
    const confirmStatus = checkIfClassConfirmed(classId, selectedDate);
    setIsConfirmed(confirmStatus.isConfirmed);
    setConfirmTime(confirmStatus.confirmTime);
    
    async function loadStudents() {
      console.log('========== LOADING STUDENTS - START ==========');
      console.log('Class ID:', classId);
      console.log('Selected Date:', selectedDate);
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // BƯỚC 1: Load danh sách TẤT CẢ học sinh trong lớp
        console.log('📌 Step 1: Load all students in class');
        const studentsApiUrl = `http://localhost:3000/api/attendance/class/${classId}/students`;
        
        const studentsRes = await fetch(studentsApiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!studentsRes.ok) {
          throw new Error(`API Error: ${studentsRes.status}`);
        }
        
        const studentsResult = await studentsRes.json();
        const allStudents = studentsResult.data || [];
        console.log('📋 Total students in class:', allStudents.length);
        
        // Khởi tạo tất cả học sinh với trạng thái "Có mặt"
        let processedStudents = allStudents.map((dbStudent: any) => ({
          studentId: dbStudent.maHocSinh,
          fullName: dbStudent.hoTen,
          class: dbStudent.maLop,
          attendance: 'present' as const,
          note: ''
        }));
        
        // BƯỚC 2: Load dữ liệu điểm danh (học sinh vắng) và MERGE
        console.log('📌 Step 2: Load attendance data for date:', selectedDate);
        const attendanceApiUrl = `http://localhost:3000/api/attendance/class/${classId}/date/${selectedDate}`;
        
        const attendanceRes = await fetch(attendanceApiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (attendanceRes.ok) {
          const attendanceResult = await attendanceRes.json();
          const attendanceRecords = attendanceResult.data || [];
          console.log('📊 Attendance records:', attendanceRecords.length);
          
          if (attendanceRecords.length > 0) {
            // Tạo Map từ dữ liệu điểm danh
            const attendanceMap = new Map(
              attendanceRecords.map((record: any) => [
                record.maHocSinh,
                {
                  trangThai: record.trangThai,
                  ghiChu: record.ghiChu || record.lyDo || '' // ✅ Fallback sang lyDo nếu không có ghiChu
                }
              ])
            );
            
            // MERGE: Cập nhật trạng thái cho học sinh vắng
            processedStudents = processedStudents.map(student => {
              const attendanceData = attendanceMap.get(student.studentId);
              if (attendanceData) {
                // Chuyển đổi trạng thái từ backend sang frontend
                const attendance = attendanceData.trangThai === 'Có phép' ? 'absent-excused' :
                                 attendanceData.trangThai === 'Không phép' ? 'absent-unexcused' :
                                 'present';
                
                return {
                  ...student,
                  attendance: attendance as const,
                  note: attendanceData.ghiChu
                };
              }
              return student;
            });
          }
        }
        
        console.log('✅ Final students:', processedStudents.length);
        setStudents(processedStudents);
        setOriginalStudents(processedStudents);
        setHasChanges(false);
        
      } catch (error) {
        console.error('❌ Error loading students:', error);
        toast.error('Lỗi khi tải danh sách học sinh!');
        setStudents([]);
        setOriginalStudents([]);
      } finally {
        setLoading(false);
        console.log('========== LOADING STUDENTS - END ==========\n');
      }
    }
    
    loadStudents();
  }, [classId, selectedDate]);

  const handleAbsentClick = (studentId: string, studentName: string) => {
    setAbsentModalData({
      studentId,
      studentName,
      type: 'absent-excused',
      reason: 'Ốm',
      note: ''
    });
    setShowAbsentModal(true);
  };

  const handleAbsentConfirm = () => {
    if (absentModalData) {
      const finalNote = absentModalData.reason + (absentModalData.note ? ` - ${absentModalData.note}` : '');
      
      setStudents(prevStudents => prevStudents.map(s => 
        s.studentId === absentModalData.studentId 
          ? { ...s, attendance: absentModalData.type, note: finalNote }
          : s
      ));
      
      if (isConfirmed) {
        setHasChanges(true);
      }
      
      setShowAbsentModal(false);
      setAbsentModalData(null);
    }
  };

  const handleAbsentCancel = () => {
    setShowAbsentModal(false);
    setAbsentModalData(null);
  };

  const updateAttendance = (studentId: string, status: 'present') => {
    setStudents(prevStudents => prevStudents.map(s => 
      s.studentId === studentId ? { ...s, attendance: status, note: '' } : s
    ));
    
    if (isConfirmed) {
      setHasChanges(true);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleConfirmAttendance = async () => {
    try {
      console.log('========== XÁC NHẬN ĐIỂM DANH - BẮT ĐẦU ==========');
      console.log('Lớp:', classId);
      console.log('Ngày:', selectedDate);
      
      setSaving(true);
      const loadingToast = toast.loading('Đang lưu điểm danh...');
      
      // Chỉ gửi học sinh vắng lên server
      const absentStudents = students
        .filter(student => student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused')
        .map(student => {
          // ✅ Tách lý do chính và ghi chú chi tiết
          const parts = student.note?.split(' - ') || [];
          const mainReason = parts[0] || '';
          const detailNote = parts.slice(1).join(' - ');
          
          // ✅ Map lý do frontend sang backend (chỉ 2 giá trị: "Việc gia đình" hoặc "Ốm")
          let lyDo = '';
          if (student.attendance === 'absent-excused') {
            // Map tất cả lý do có phép sang 1 trong 2 giá trị backend yêu cầu
            if (mainReason === 'Ốm' || mainReason === 'Đi khám bệnh') {
              lyDo = 'Ốm';
            } else {
              lyDo = 'Việc gia đình'; // "Có việc gia đình", "Nghỉ có phép"
            }
          }
          
          // ✅ Ghép lại ghi chú đầy đủ (lý do gốc + chi tiết)
          const ghiChu = mainReason + (detailNote ? ` - ${detailNote}` : '');
          
          return {
            maHocSinh: student.studentId,
            maLop: classId,
            ngayDiemDanh: selectedDate,
            trangThai: student.attendance === 'absent-excused' ? 'Có phép' : 'Không phép',
            lyDo: lyDo, // ✅ Chỉ gửi "Ốm" hoặc "Việc gia đình"
            ghiChu: ghiChu // ✅ Lưu lý do đầy đủ vào ghiChu
          };
        });

      console.log('📊 Thống kê:', {
        total: students.length,
        present: students.filter(s => s.attendance === 'present').length,
        absent: absentStudents.length,
        withNotes: absentStudents.filter(s => s.ghiChu).length
      });
      
      const token = localStorage.getItem('token');
      
      // GỬI TỪNG BẢN GHI ĐIỂM DANH (thay vì bulk)
      let successCount = 0;
      let errorCount = 0;
      
      if (absentStudents.length > 0) {
        console.log('📌 Gửi từng bản ghi điểm danh...');
        
        for (const student of absentStudents) {
          try {
            const apiUrl = 'http://localhost:3000/api/attendance';
            console.log('➡️ Gửi:', student.maHocSinh, '-', student.trangThai, '- Ghi chú:', student.ghiChu); // ✅ Log ghi chú
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(student)
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Lỗi cho', student.maHocSinh, ':', errorText);
              errorCount++;
            } else {
              const result = await response.json();
              console.log('✅ Thành công:', student.maHocSinh, '- Ghi chú đã lưu:', student.ghiChu || '(trống)'); // ✅ Confirm
              successCount++;
            }
          } catch (error) {
            console.error('❌ Exception cho', student.maHocSinh, ':', error);
            errorCount++;
          }
        }
        
        console.log('📈 Kết quả:', { successCount, errorCount, total: absentStudents.length });
      } else {
        console.log('✅ Không có học sinh vắng');
      }
      
      // GỌI API XÁC NHẬN
      const confirmUrl = 'http://localhost:3000/api/attendance/confirm';
      console.log('📌 Gửi xác nhận điểm danh đến API:', confirmUrl);
      
      const confirmResponse = await fetch(confirmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          maLop: classId, 
          ngayDiemDanh: selectedDate 
        })
      });
      
      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text();
        console.error('❌ Lỗi API confirm:', errorText);
      } else {
        const confirmResult = await confirmResponse.json();
        console.log('✅ Xác nhận thành công:', confirmResult);
      }
      
      // ✅ RELOAD DỮ LIỆU TỪ SERVER để hiển thị ghi chú
      console.log('📌 Reload dữ liệu từ server...');
      await reloadAttendanceData();
      
      // Lưu trạng thái xác nhận vào localStorage
      const now = new Date().toISOString();
      setConfirmTime(now);
      setIsConfirmed(true);
      setHasChanges(false);
      // ✅ Không setOriginalStudents ở đây vì đã reload từ server
      saveConfirmationStatus(classId, selectedDate);
      
      toast.dismiss(loadingToast);
      
      if (errorCount > 0) {
        toast.error(`⚠️ Lưu thành công ${successCount}/${absentStudents.length} bản ghi. ${errorCount} lỗi!`, { duration: 5000 });
      } else if (absentStudents.length === 0) {
        toast.success('✅ Đã xác nhận điểm danh! Lớp không có học sinh vắng.', { duration: 3000 });
      } else {
        toast.success(`✅ Đã xác nhận điểm danh và lưu ghi chú thành công!`, { duration: 4000 }); // ✅ Cập nhật message
      }
      
      console.log('========== XÁC NHẬN ĐIỂM DANH - THÀNH CÔNG ==========\n');
      
    } catch (error) {
      console.error('========== XÁC NHẬN ĐIỂM DANH - LỖI ==========');
      console.error('Error:', error);
      toast.error('❌ Lỗi khi lưu điểm danh. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Handle update attendance (after confirmation)
  const handleUpdateAttendance = async () => {
    if (!hasChanges) {
      toast.error('Không có thay đổi nào để cập nhật!');
      return;
    }

    try {
      console.log('========== CẬP NHẬT ĐIỂM DANH - BẮT ĐẦU ==========');
      
      setSaving(true);
      const loadingToast = toast.loading('Đang cập nhật điểm danh...');
      
      const token = localStorage.getItem('token');
      
      // BƯỚC 1: Xóa tất cả điểm danh cũ của ngày này
      console.log('📌 Bước 1: Xóa điểm danh cũ');
      const getUrl = `http://localhost:3000/api/attendance/class/${classId}/date/${selectedDate}`;
      const getResponse = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const oldData = await getResponse.json();
        const oldRecords = oldData.data || [];
        
        if (oldRecords.length > 0) {
          console.log('🗑️ Đang xóa', oldRecords.length, 'bản ghi cũ...');
          
          const deletePromises = oldRecords.map(record => {
            const deleteUrl = `http://localhost:3000/api/attendance/${record.maDiemDanh}`;
            return fetch(deleteUrl, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          });
          
          await Promise.all(deletePromises);
          console.log('✅ Đã xóa tất cả', oldRecords.length, 'bản ghi cũ');
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // BƯỚC 2: Tạo dữ liệu mới với GHI CHÚ ĐẦY ĐỦ
      const absentStudents = students
        .filter(student => student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused')
        .map(student => {
          // ✅ Tách lý do chính và ghi chú chi tiết
          const parts = student.note?.split(' - ') || [];
          const mainReason = parts[0] || '';
          const detailNote = parts.slice(1).join(' - ');
          
          // ✅ Map lý do frontend sang backend
          let lyDo = '';
          if (student.attendance === 'absent-excused') {
            if (mainReason === 'Ốm' || mainReason === 'Đi khám bệnh') {
              lyDo = 'Ốm';
            } else {
              lyDo = 'Việc gia đình';
            }
          }
          
          // ✅ Ghép lại ghi chú đầy đủ
          const ghiChu = mainReason + (detailNote ? ` - ${detailNote}` : '');
          
          return {
            maHocSinh: student.studentId,
            maLop: classId,
            ngayDiemDanh: selectedDate,
            trangThai: student.attendance === 'absent-excused' ? 'Có phép' : 'Không phép',
            lyDo: lyDo, // ✅ "Ốm" hoặc "Việc gia đình"
            ghiChu: ghiChu // ✅ Lý do đầy đủ
          };
        });

      console.log('📊 Dữ liệu mới:', {
        total: students.length,
        present: students.filter(s => s.attendance === 'present').length,
        absent: absentStudents.length,
        withNotes: absentStudents.filter(s => s.ghiChu).length // ✅ Đếm số bản ghi có ghi chú
      });
      
      // BƯỚC 3: Lưu từng bản ghi mới
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      if (absentStudents.length > 0) {
        console.log('📌 Bước 2: Lưu điểm danh mới từng bản ghi...');
        
        for (const student of absentStudents) {
          try {
            const apiUrl = 'http://localhost:3000/api/attendance';
            console.log('➡️ Gửi:', student.maHocSinh, '-', student.trangThai, '- Ghi chú:', student.ghiChu); // ✅ Log ghi chú
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(student) // ✅ Đảm bảo ghiChu được gửi
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              console.error('❌ Lỗi cho', student.maHocSinh, ':', result.message || response.statusText);
              errors.push(`${student.maHocSinh}: ${result.message || 'Lỗi không xác định'}`);
              errorCount++;
            } else {
              console.log('✅ Thành công:', student.maHocSinh, '- Ghi chú đã lưu:', student.ghiChu || '(trống)'); // ✅ Confirm
              successCount++;
            }
          } catch (error) {
            console.error('❌ Exception cho', student.maHocSinh, ':', error);
            errors.push(`${student.maHocSinh}: ${error instanceof Error ? error.message : 'Lỗi kết nối'}`);
            errorCount++;
          }
        }
        
        console.log('📈 Kết quả:', { successCount, errorCount, total: absentStudents.length });
        if (errors.length > 0) {
          console.error('📋 Chi tiết lỗi:', errors);
        }
      }
      
      // BƯỚC 4: RELOAD DỮ LIỆU TỪ SERVER để cập nhật giao diện
      console.log('📌 Bước 3: Reload dữ liệu từ server...');
      await reloadAttendanceData();
      
      // Reset changes flag
      setHasChanges(false);
      setOriginalStudents([...students]);
      
      toast.dismiss(loadingToast);
      
      if (errorCount > 0) {
        toast.error(`⚠️ Cập nhật ${successCount}/${absentStudents.length} bản ghi. ${errorCount} lỗi!`, { duration: 7000 });
      } else {
        toast.success('✅ Cập nhật điểm danh và ghi chú thành công!', { duration: 3000 }); // ✅ Thông báo rõ ràng
      }
      
      console.log('========== CẬP NHẬT ĐIỂM DANH - THÀNH CÔNG ==========\n');
      
    } catch (error) {
      console.error('========== CẬP NHẬT ĐIỂM DANH - LỖI ==========');
      console.error('Error:', error);
      toast.error('❌ Lỗi khi cập nhật điểm danh. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Function để reload dữ liệu điểm danh từ server
  const reloadAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load lại dữ liệu điểm danh
      const attendanceApiUrl = `http://localhost:3000/api/attendance/class/${classId}/date/${selectedDate}`;
      
      const attendanceRes = await fetch(attendanceApiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (attendanceRes.ok) {
        const attendanceResult = await attendanceRes.json();
        const attendanceRecords = attendanceResult.data || [];
        console.log('🔄 Reload: có', attendanceRecords.length, 'bản ghi điểm danh');
        
        // ✅ Log chi tiết từng bản ghi để debug
        attendanceRecords.forEach((record: any) => {
          console.log('📄 Record:', {
            maHS: record.maHocSinh,
            trangThai: record.trangThai,
            lyDo: record.lyDo,
            ghiChu: record.ghiChu
          });
        });
        
        // Tạo Map từ dữ liệu điểm danh
        const attendanceMap = new Map(
          attendanceRecords.map((record: any) => [
            record.maHocSinh,
            {
              trangThai: record.trangThai,
              lyDo: record.lyDo || '',
              ghiChu: record.ghiChu || '' // ✅ Lấy cả lyDo và ghiChu
            }
          ])
        );
        
        // Cập nhật lại state students
        const updatedStudents = students.map(student => {
          const attendanceData = attendanceMap.get(student.studentId);
          if (attendanceData) {
            // Chuyển đổi trạng thái từ backend sang frontend
            const attendance = attendanceData.trangThai === 'Có phép' ? 'absent-excused' :
                             attendanceData.trangThai === 'Không phép' ? 'absent-unexcused' :
                             'present';
            
            // ✅ Hiển thị ghiChu (chứa lý do đầy đủ)
            const displayNote = attendanceData.ghiChu || attendanceData.lyDo || ''; // ✅ Ưu tiên ghiChu, fallback lyDo
            
            console.log(`✅ Map student ${student.studentId}:`, {
              attendance,
              note: displayNote
            });
            
            return {
              ...student,
              attendance: attendance as const,
              note: displayNote // ✅ Lấy ghiChu để hiển thị
            };
          }
          // Nếu không có trong dữ liệu điểm danh => Có mặt
          return {
            ...student,
            attendance: 'present' as const,
            note: ''
          };
        });
        
        console.log('📊 Updated students:', updatedStudents.map(s => ({
          id: s.studentId,
          name: s.fullName,
          attendance: s.attendance,
          note: s.note
        })));
        
        setStudents(updatedStudents);
        setOriginalStudents(updatedStudents);
        console.log('✅ Đã reload và cập nhật giao diện');
      }
    } catch (error) {
      console.error('❌ Lỗi reload dữ liệu:', error);
    }
  };

  // Check if can edit attendance
  const canEditAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate;
    
    // Không cho phép điểm danh ngày tương lai
    if (selectedDateStr > today) {
      return false;
    }
    
    // Nếu chưa xác nhận - cho phép sửa trong ngày hôm nay
    if (!isConfirmed) {
      return selectedDateStr === today;
    }
    
    // Đã xác nhận - kiểm tra thời gian 24 giờ
    if (confirmTime) {
      const confirmTimeDate = new Date(confirmTime);
      const now = new Date();
      const diffHours = (now.getTime() - confirmTimeDate.getTime()) / (1000 * 60 * 60);
      return diffHours < 24;
    }
    
    return selectedDateStr === today;
  };

  // Get remaining edit time
  const getRemainingEditTime = () => {
    const confirmStatus = checkIfClassConfirmed(classId, selectedDate);
    
    if (!confirmStatus.isConfirmed || !confirmStatus.confirmTime) {
      return null;
    }
    
    const confirmTime = new Date(confirmStatus.confirmTime);
    const now = new Date();
    const diffHours = (now.getTime() - confirmTime.getTime()) / (1000 * 60 * 60);
    const remainingHours = 24 - diffHours;
    
    if (remainingHours <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }
    
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    
    return { hours, minutes, expired: false };
  };

  const shouldShowConfirmButton = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${dayOfWeek}, ${day} tháng ${month}, ${year}`;
  };

  const attendanceStats = {
    total: students.length,
    present: students.filter(s => s.attendance === 'present').length,
    absentExcused: students.filter(s => s.attendance === 'absent-excused').length,
    absentUnexcused: students.filter(s => s.attendance === 'absent-unexcused').length,
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const nameLower = student.fullName.toLowerCase();
    const idLower = student.studentId.toLowerCase();
    
    return nameLower.includes(searchLower) || idLower.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Đang tải dữ liệu điểm danh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: { background: '#10b981', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#10b981' },
          },
          error: {
            style: { background: '#ef4444', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#ef4444' },
          },
          loading: {
            style: { background: '#3b82f6', color: '#fff' },
          },
        }}
      />
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600 text-sm hover:text-blue-600">Quay lại</span>
        </div>
        
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Lớp {classInfo.name}</h1>
          <p className="text-gray-600 text-sm">Giáo viên: {classInfo.teacher}</p>
        </div>

        {/* Stats Cards */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceStats.total}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Có mặt</p>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vắng</p>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absentExcused + attendanceStats.absentUnexcused}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Điểm danh học sinh</h2>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">{formatDisplayDate(selectedDate)}</p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Ngày:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Display */}
              {isConfirmed && (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Đã xác nhận điểm danh</span>
                  </div>
                  {(() => {
                    const timeRemaining = getRemainingEditTime();
                    if (timeRemaining && !timeRemaining.expired) {
                      return (
                        <span className="text-xs text-orange-600">
                          ⏰ Còn {timeRemaining.hours} giờ {timeRemaining.minutes} phút để sửa
                        </span>
                      );
                    } else if (timeRemaining?.expired) {
                      return (
                        <span className="text-xs text-red-600">
                          🔒 Đã hết hạn sửa (quá 24 giờ)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Student Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-16">STT</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-32">Mã HS</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tên học sinh</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 w-32">Trạng thái</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 w-48">Lý do</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 w-40">Điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.studentId}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{student.fullName}</td>
                    <td className="py-3 px-4 text-center">
                      {student.attendance === 'present' && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Có mặt
                        </Badge>
                      )}
                      {student.attendance === 'absent-excused' && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <XCircle className="w-3 h-3 mr-1" />
                          Vắng có phép
                        </Badge>
                      )}
                      {student.attendance === 'absent-unexcused' && (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          <XCircle className="w-3 h-3 mr-1" />
                          Vắng không phép
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-500">
                      {student.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const canEdit = canEditAttendance();
                        
                        return (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              disabled={!canEdit}
                              variant={student.attendance === 'present' ? 'default' : 'outline'}
                              className={`px-3 py-1 text-xs ${
                                !canEdit 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : student.attendance === 'present' 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'border-green-300 text-green-600 hover:bg-green-50'
                              }`}
                              onClick={() => canEdit && updateAttendance(student.studentId, 'present')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Có mặt
                            </Button>
                            <Button
                              size="sm"
                              disabled={!canEdit}
                              variant={student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused' ? 'default' : 'outline'}
                              className={`px-3 py-1 text-xs ${
                                !canEdit 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused'
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'border-red-300 text-red-600 hover:bg-red-50'
                              }`}
                              onClick={() => canEdit && handleAbsentClick(student.studentId, student.fullName)}
                            >
                              Vắng
                            </Button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            {shouldShowConfirmButton() && !isConfirmed ? (
              <Button 
                onClick={handleConfirmAttendance}
                disabled={saving}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-2"
              >
                {saving ? 'Đang lưu...' : 'Xác nhận điểm danh'}
              </Button>
            ) : shouldShowConfirmButton() && isConfirmed && hasChanges ? (
              <Button 
                onClick={handleUpdateAttendance}
                disabled={saving}
                className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-2"
              >
                {saving ? 'Đang cập nhật...' : 'Cập nhật thay đổi'}
              </Button>
            ) : shouldShowConfirmButton() && isConfirmed ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Đã xác nhận điểm danh hôm nay</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500 font-medium">
                  {selectedDate > new Date().toISOString().split('T')[0] 
                    ? 'Chưa tới ngày điểm danh' 
                    : 'Dữ liệu lịch sử'
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Absent Modal */}
      {showAbsentModal && absentModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chọn lý do vắng</h3>
              <button onClick={handleAbsentCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Học sinh: <span className="font-medium">{absentModalData.studentName}</span></p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do vắng</label>
              <select
                value={absentModalData.reason}
                onChange={(e) => {
                  const selectedReason = e.target.value;
                  const type = ['Ốm', 'Có việc gia đình', 'Đi khám bệnh', 'Nghỉ có phép'].includes(selectedReason) 
                    ? 'absent-excused' 
                    : 'absent-unexcused';
                  setAbsentModalData({ 
                    ...absentModalData, 
                    reason: selectedReason,
                    type: type
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Có phép">
                  <option value="Ốm">Ốm</option>
                  <option value="Có việc gia đình">Có việc gia đình</option>
                  <option value="Đi khám bệnh">Đi khám bệnh</option>
                  <option value="Nghỉ có phép">Nghỉ có phép</option>
                </optgroup>
                <optgroup label="Không phép">
                  <option value="Vắng không phép">Vắng không phép</option>
                  <option value="Trốn học">Trốn học</option>
                  <option value="Không lý do">Không lý do</option>
                </optgroup>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết thêm (không bắt buộc)</label>
              <textarea
                value={absentModalData.note}
                onChange={(e) => setAbsentModalData({ ...absentModalData, note: e.target.value })}
                placeholder="Nhập chi tiết thêm..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Xem trước lý do vắng:</p>
              <p className="text-sm font-medium text-gray-800">
                {absentModalData.reason}{absentModalData.note ? ` - ${absentModalData.note}` : ''}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleAbsentCancel} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2">
                Hủy
              </Button>
              <Button onClick={handleAbsentConfirm} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2">
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
