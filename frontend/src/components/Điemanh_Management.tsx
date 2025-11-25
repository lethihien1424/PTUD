import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AttendanceService } from '../services/attendanceService';

interface StudentAttendance {
  studentId: string;
  fullName: string;
  class: string;
  attendance: 'present' | 'absent-excused' | 'absent-unexcused' | 'pending';
  note?: string;
}

interface AttendanceManagementProps {
  classId: string;
  onBack: () => void;
  onAttendanceComplete: (classId: string) => void;
  selectedDate?: string; // Thêm prop để nhận ngày từ component cha
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

  // Check if this class has been confirmed for the selected date
  const checkIfClassConfirmed = (classId: string, date: string) => {
    // Check if this class was confirmed for this specific date
    const confirmedKey = `${classId}-${date}`;
    const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
    return confirmedClasses[confirmedKey] || false;
  };

  // Save confirmation status
  const saveConfirmationStatus = (classId: string, date: string) => {
    const confirmedKey = `${classId}-${date}`;
    const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
    confirmedClasses[confirmedKey] = true;
    localStorage.setItem('confirmedAttendance', JSON.stringify(confirmedClasses));
  };

  // Reset state when classId changes
  useEffect(() => {
    setStudents([]);
    setSearchTerm('');
    setShowAbsentModal(false);
    setAbsentModalData(null);
    
    // Check if this class is already confirmed for the selected date
    const isConfirmed = checkIfClassConfirmed(classId, selectedDate);
    setIsConfirmed(isConfirmed);
    
    loadStudentsAndAttendance();
  }, [classId, selectedDate]);

  const loadStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      
      // Get real students from database for this specific class
      const dbStudents = await AttendanceService.getStudentsByClass(classId);
      
      if (dbStudents.length === 0) {
        console.warn(`No students found for class ${classId}`);
        setStudents([]);
        return;
      }

      // Convert database students to component format - mặc định là "Có mặt"
      const studentsData: StudentAttendance[] = dbStudents.map(dbStudent => ({
        studentId: dbStudent.studentId,
        fullName: dbStudent.fullName,
        class: dbStudent.class,
        attendance: 'present' as const, // Thay đổi từ 'pending' thành 'present'
        note: ''
      }));

      // Get existing attendance records for the selected date
      const selectedDateObj = new Date(selectedDate);
      const existingAttendance = await AttendanceService.getAttendanceByDateAndClass(
        selectedDateObj, 
        classId, 
        'morning'
      );

      // Map existing attendance to students with proper typing
      const attendanceMap = new Map<string, { status: string; note: string }>();
      existingAttendance.forEach((record: any) => {
        attendanceMap.set(record.studentId, {
          status: record.status,
          note: record.note || ''
        });
      });

      // Update students with existing attendance data
      const finalStudentsData = studentsData.map(student => {
        const existingRecord = attendanceMap.get(student.studentId);
        if (existingRecord) {
          return {
            ...student,
            attendance: existingRecord.status as 'present' | 'absent-excused' | 'absent-unexcused' | 'pending',
            note: existingRecord.note
          };
        }
        return student;
      });

      setStudents(finalStudentsData);
      
    } catch (error) {
      console.error('Error loading students and attendance:', error);
      alert('Không thể tải dữ liệu học sinh và điểm danh');
      // Fallback to empty array
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

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
      setStudents(students.map(s => 
        s.studentId === absentModalData.studentId 
          ? { ...s, attendance: absentModalData.type, note: finalNote }
          : s
      ));
      setShowAbsentModal(false);
      setAbsentModalData(null);
      
      // Khi có thay đổi điểm danh vắng, hủy trạng thái đã xác nhận để cho phép xác nhận lại
      if (isConfirmed) {
        setIsConfirmed(false);
        // Xóa trạng thái confirmed trong localStorage
        const confirmedKey = `${classId}-${selectedDate}`;
        const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
        delete confirmedClasses[confirmedKey];
        localStorage.setItem('confirmedAttendance', JSON.stringify(confirmedClasses));
      }
    }
  };

  const handleAbsentCancel = () => {
    setShowAbsentModal(false);
    setAbsentModalData(null);
  };

  const updateAttendance = (studentId: string, status: 'present') => {
    setStudents(students.map(s => 
      s.studentId === studentId ? { ...s, attendance: status, note: '' } : s
     ));
    
    // Khi có thay đổi điểm danh, hủy trạng thái đã xác nhận để cho phép xác nhận lại
    if (isConfirmed) {
      setIsConfirmed(false);
      // Xóa trạng thái confirmed trong localStorage
      const confirmedKey = `${classId}-${selectedDate}`;
      const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
      delete confirmedClasses[confirmedKey];
      localStorage.setItem('confirmedAttendance', JSON.stringify(confirmedClasses));
    }
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceData = students.map(student => ({
        studentId: student.studentId,
        studentName: student.fullName,
        classId: classId,
        date: new Date(selectedDate),
        session: 'morning' as const,
        status: student.attendance === 'absent-excused' ? 'absent-excused' as const :
                student.attendance === 'absent-unexcused' ? 'absent-unexcused' as const :
                'present' as const,
        note: student.note || '',
        recordedBy: 'GV001'
      }));

      await AttendanceService.saveMultipleAttendance(attendanceData);
      
      alert('Đã lưu điểm danh vào database thành công!');
      
      onAttendanceComplete(classId);
      
    } catch (error) {
      console.error('Error saving attendance to database:', error);
      alert('Lỗi khi lưu vào database. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    
    setTimeout(() => {
      loadStudentsAndAttendance();
      setLoading(false);
    }, 500);
  };

  const handleConfirmAttendance = async () => {
    // Check if all students have been marked
    const pendingCount = students.filter(s => s.attendance === 'pending').length;
    
    if (pendingCount > 0) {
      alert(`Không thể xác nhận! Còn ${pendingCount} học sinh chưa được điểm danh.`);
      return;
    }
    
    try {
      // Save attendance data to storage
      const attendanceData = students.map(student => ({
        studentId: student.studentId,
        studentName: student.fullName,
        classId: classId,
        date: new Date(selectedDate),
        session: 'morning' as const,
        status: student.attendance === 'absent-excused' ? 'absent-excused' as const :
                student.attendance === 'absent-unexcused' ? 'absent-unexcused' as const :
                'present' as const,
        note: student.note || '',
        recordedBy: 'GV001'
      }));

      await AttendanceService.saveMultipleAttendance(attendanceData);
      
      // Save confirmation status
      saveConfirmationStatus(classId, selectedDate);
      setIsConfirmed(true);
      onAttendanceComplete(classId);
      
      console.log('Attendance confirmed and saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Lỗi khi lưu điểm danh. Vui lòng thử lại.');
    }
  };

  // Check if can edit attendance based on date only (allow recent days)
  const canEditAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate;
    
    // Parse dates for comparison
    const todayObj = new Date(today);
    const selectedDateObj = new Date(selectedDateStr);
    
    // Calculate difference in days
    const diffTime = todayObj.getTime() - selectedDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Allow editing for:
    // - Today (diffDays = 0)
    // - Yesterday (diffDays = 1) 
    // - Day before yesterday (diffDays = 2)
    if (diffDays >= 0 && diffDays <= 2) {
      return true;
    }
    
    // Block editing for dates more than 2 days ago or future dates
    return false;
  };

  // Check if should show confirm button
  const shouldShowConfirmButton = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today; // Chỉ hiện nút xác nhận cho ngày hôm nay
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
    pending: students.filter(s => s.attendance === 'pending').length,
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassInfo = (classId: string) => {
    const classMap: Record<string, { name: string; teacher: string }> = {
      '10a1': { name: '10A1', teacher: 'Trần Thị B' },
      '10a2': { name: '10A2', teacher: 'Nguyễn Văn C' },
      '10a3': { name: '10A3', teacher: 'Lê Thị D' },
      '11a1': { name: '11A1', teacher: 'Phạm Văn E' },
      '11a2': { name: '11A2', teacher: 'Hoàng Thị F' },
      '12a1': { name: '12A1', teacher: 'Đỗ Văn G' },
    };
    return classMap[classId] || { name: classId.toUpperCase(), teacher: 'Chưa xác định' };
  };

  const classInfo = getClassInfo(classId);

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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        {/* Back button */}
        <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600 text-sm hover:text-blue-600">Quay lại</span>
        </div>
        
        {/* Class Info */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Lớp {classInfo.name}</h1>
          <p className="text-gray-600 text-sm">Giáo viên: {classInfo.teacher}</p>
        </div>

        {/* Stats Cards - Single Row Layout */}
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

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chưa điểm danh</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Attendance Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Section Header with Confirm Button */}
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

              {/* Confirm Button */}
              {!isConfirmed && shouldShowConfirmButton() ? (
                <Button 
                  onClick={handleConfirmAttendance}
                  disabled={saving || attendanceStats.pending > 0}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-2"
                >
                  {attendanceStats.pending > 0 ? `Còn ${attendanceStats.pending} chưa điểm danh` : 'Xác nhận'}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Đã xác nhận điểm danh</span>
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
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 w-24">Ghi chú</th>
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
                        <Badge className="bg-red-100 text-red-700 border-red-300">
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
                      {student.attendance === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Chưa điểm danh
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-500">
                      {student.note || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canEditAttendance() ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant={student.attendance === 'present' ? 'default' : 'outline'}
                            className={`px-3 py-1 text-xs ${
                              student.attendance === 'present' 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'border-green-300 text-green-600 hover:bg-green-50'
                            }`}
                            onClick={() => updateAttendance(student.studentId, 'present')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Có mặt
                          </Button>
                          <Button
                            size="sm"
                            variant={student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused' ? 'default' : 'outline'}
                            className={`px-3 py-1 text-xs ${
                              student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused'
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                            onClick={() => handleAbsentClick(student.studentId, student.fullName)}
                          >
                            Vắng
                          </Button>
                        </div>
                      ) : selectedDate === new Date().toISOString().split('T')[0] && isConfirmed ? (
                        // Trường hợp đã xác nhận hôm nay - hiển thị nút nhưng disabled
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            disabled
                            variant={student.attendance === 'present' ? 'default' : 'outline'}
                            className={`px-3 py-1 text-xs opacity-60 cursor-not-allowed ${
                              student.attendance === 'present' 
                                ? 'bg-green-600 text-white' 
                                : 'border-green-300 text-green-600'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Có mặt
                          </Button>
                          <Button
                            size="sm"
                            disabled
                            variant={student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused' ? 'default' : 'outline'}
                            className={`px-3 py-1 text-xs opacity-60 cursor-not-allowed ${
                              student.attendance === 'absent-excused' || student.attendance === 'absent-unexcused'
                                ? 'bg-red-600 text-white' 
                                : 'border-red-300 text-red-600'
                            }`}
                          >
                            Vắng
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {selectedDate === new Date().toISOString().split('T')[0] 
                            ? 'Đã khóa chỉnh sửa' 
                            : 'Không thể sửa ngày khác'
                          }
                        </span>
                      )}
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
                disabled={saving || attendanceStats.pending > 0}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-2"
              >
                {attendanceStats.pending > 0 ? `Còn ${attendanceStats.pending} chưa điểm danh` : 'Xác nhận'}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border border-gray-200">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Ghi chú thêm</label>
                <span className="text-xs text-gray-500">(Tùy chọn)</span>
              </div>
              <textarea
                value={absentModalData.note}
                onChange={(e) => setAbsentModalData({ ...absentModalData, note: e.target.value })}
                placeholder="Ví dụ: Có giấy phép của bác sĩ, sốt 38.5°C..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-600 mb-1">Xem trước ghi chú:</p>
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
