import React, { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';


// Component để hiển thị sĩ số với dữ liệu attendance thực tế
function AttendanceDisplay({ classInfo, statusForDate, selectedDate, getAttendanceStatsForClass, refreshTrigger }: {
  classInfo: ClassInfo;
  statusForDate: string;
  selectedDate: string;
  getAttendanceStatsForClass: (classId: string, date: string) => Promise<{presentCount: number, totalCount: number} | null>;
  refreshTrigger?: number; // Thêm prop để trigger reload
}) {
  const [attendanceStats, setAttendanceStats] = useState<{presentCount: number, totalCount: number} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 AttendanceDisplay effect triggered:', {
      classId: classInfo.classId,
      date: selectedDate,
      status: statusForDate,
      refreshTrigger
    });
    
    if (statusForDate === 'completed') {
      setLoading(true);
      getAttendanceStatsForClass(classInfo.classId, selectedDate)
        .then(stats => {
          console.log('📊 Stats loaded for', classInfo.classId, ':', stats);
          setAttendanceStats(stats);
        })
        .catch(error => {
          console.error('❌ Error loading attendance stats:', error);
          setAttendanceStats(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAttendanceStats(null);
    }
  }, [classInfo.classId, selectedDate, statusForDate, refreshTrigger]); // Thêm refreshTrigger vào dependencies

  if (loading) {
    return <span className="text-xs text-gray-500">Đang tải...</span>;
  }

  const today = new Date().toISOString().split('T')[0];
  
  if (statusForDate === 'completed' && attendanceStats) {
    // Đã hoàn thành - hiển thị số có mặt/tổng số từ dữ liệu thực
    const absentCount = attendanceStats.totalCount - attendanceStats.presentCount;
    return (
      <div className="flex flex-col items-center">
        <span>{attendanceStats.presentCount}/{attendanceStats.totalCount}</span>
        {absentCount > 0 && (
          <span className="text-xs text-red-600">({absentCount} vắng)</span>
        )}
      </div>
    );
  } else if (statusForDate === 'completed' && !attendanceStats) {
    // Đã hoàn thành nhưng không có dữ liệu - giả định tất cả có mặt
    return `${classInfo.currentStudents}/${classInfo.currentStudents}`;
  } else if (selectedDate === today || statusForDate === 'pending' || statusForDate === 'incomplete') {
    // Ngày hôm nay hoặc chưa điểm danh - hiển thị giả định tất cả có mặt
    return `${classInfo.currentStudents}/${classInfo.currentStudents}`;
  } else {
    // Fallback - hiển thị format [có mặt]/[tổng số] thay vì [hiện tại]/[tối đa]
    return `${classInfo.currentStudents}/${classInfo.currentStudents}`;
  }
}

interface ClassInfo {
  classId: string;
  className: string;
  homeRoomTeacher: string;
  schedule: string;
  currentStudents: number;
  maxStudents: number;
  academicYear: string;
  status: 'active' | 'completed' | 'pending' | 'incomplete';
}

interface ClassListProps {
  onSelectClass: (classId: string, date?: string) => void;
  completedClasses: Set<string>;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onViewAllClasses: () => void;
  refreshKey?: number; // Thêm prop refreshKey từ parent
}

export function ClassList({ onSelectClass, completedClasses, selectedDate, onDateChange, onViewAllClasses, refreshKey }: ClassListProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, Set<string>>>({});

  // Load classes from database
  useEffect(() => {
    async function loadClasses() {
      console.log('========== LOADING CLASSES FOR ATTENDANCE - START ==========');
      console.log('Selected Date:', selectedDate);
      console.log('Refresh Key:', refreshKey);
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('📌 Token:', token ? 'exists' : 'not found');
        
        const apiUrl = 'http://localhost:3000/api/attendance/classes/all';
        console.log('📌 Fetching from:', apiUrl);
        
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 Response status:', res.status, res.statusText);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`API Error: ${res.status}`);
        }
        
        const result = await res.json();
        console.log('📦 API Response:', result);
        console.log('  - Success:', result.success);
        console.log('  - Data length:', result.data ? result.data.length : 'null');
        console.log('  - First item:', result.data?.[0]);
        
        const dbClasses = result.data || [];
        console.log('📋 Processing', dbClasses.length, 'classes...');
        
        const processedClasses = dbClasses.map((dbClass: any, index: number) => {
          console.log(`  Class ${index + 1}:`, {
            maLop: dbClass.maLop,
            tenLop: dbClass.tenLop,
            khoi: dbClass.khoi,
            gvcn: dbClass.tenGiaoVienChuNhiem,
            siSo: dbClass.siSo,
            soHocSinh: dbClass.soHocSinh
          });
          
          return {
            classId: dbClass.maLop,
            className: dbClass.tenLop,
            homeRoomTeacher: dbClass.tenGiaoVienChuNhiem || 'Chưa phân công',
            schedule: dbClass.khoi ? `Khối ${dbClass.khoi}` : '',
            currentStudents: dbClass.soHocSinh || 0,
            maxStudents: dbClass.siSo || 0,
            academicYear: dbClass.tenTruong || 'THPT Thạnh Lộc',
            status: 'pending' as const
          };
        });
        
        console.log('✅ Processed classes:', processedClasses);
        setClasses(processedClasses);
        
      } catch (error) {
        console.error('❌ Error loading classes:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        setClasses([]);
      } finally {
        setLoading(false);
        console.log('========== LOADING CLASSES FOR ATTENDANCE - END ==========\n');
      }
    }
    loadClasses();
  }, [selectedDate, refreshKey]); // Thêm refreshKey vào dependencies

  // Mock attendance history data - TODO: Replace with real data from database
  useEffect(() => {
    const mockAttendanceHistory: Record<string, Set<string>> = {
      '2025-10-27': new Set(['10a1', '11a1', '12a1']),
      '2025-10-28': new Set(['10a2', '11a2']),  
      '2025-10-29': new Set(['10a1']),
    };
    setAttendanceHistory(mockAttendanceHistory);
  }, []);

  const handleDateChange = (date: string) => {
    onDateChange(date); // Sử dụng callback từ parent component
    setLoading(true);
    
    // Clear current classes to prevent stale data in stats calculation
    setClasses([]);
    
    // Load classes for new date will be triggered by useEffect when selectedDate changes
    setLoading(false);
  };

  const getClassStatusForDate = (classInfo: ClassInfo, date: string) => {
    // Check localStorage for confirmed status first
    const confirmedKey = `${classInfo.classId}-${date}`;
    const confirmedClasses = JSON.parse(localStorage.getItem('confirmedAttendance') || '{}');
    
    if (confirmedClasses[confirmedKey]) {
      return 'completed';
    }
    
    // Check if this class was marked as completed for the selected date (fallback)
    const attendanceForDate = attendanceHistory[date] || new Set();
    if (attendanceForDate.has(classInfo.classId)) {
      return 'completed';
    }
    
    // If it's today, use the real-time completed status
    const today = new Date().toISOString().split('T')[0];
    if (date === today && completedClasses.has(classInfo.classId)) {
      return 'completed';
    }
    
    // For past dates - if not in attendance history, consider it incomplete
    const selectedDateObj = new Date(date);
    const todayObj = new Date();
    
    if (selectedDateObj < todayObj) {
      return 'incomplete'; // Chưa hoàn thành (ngày đã qua nhưng chưa điểm danh)
    }
    
    // For future dates - show as pending (chưa điểm danh)
    if (selectedDateObj > todayObj) {
      return 'pending'; // Chưa điểm danh (ngày chưa tới)
    }
    
    // For today - use the original status
    return classInfo.status;
  };

  const getStatsForDate = (date: string) => {
    const attendanceForDate = attendanceHistory[date] || new Set();
    const today = new Date().toISOString().split('T')[0];
    
    let completedCount = 0;
    
    // Count completed classes based on actual status for each class
    classes.forEach(classInfo => {
      const status = getClassStatusForDate(classInfo, date);
      if (status === 'completed') {
        completedCount++;
      }
    });
    
    return {
      totalClasses: classes.length,
      completedClasses: completedCount,
      pendingClasses: classes.length - completedCount
    };
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Đã hoàn thành</Badge>;
      case 'incomplete':
        return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">Chưa hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Chưa điểm danh</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Hoạt động</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Chưa điểm danh</Badge>;
    }
  };

  // Helper function to get attendance stats for a class on a specific date
  const getAttendanceStatsForClass = async (classId: string, date: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // BƯỚC 1: Lấy tổng số học sinh trong lớp
      const studentsApiUrl = `http://localhost:3000/api/attendance/class/${classId}/students`;
      console.log('📊 Step 1: Getting total students:', studentsApiUrl);
      
      const studentsRes = await fetch(studentsApiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!studentsRes.ok) {
        console.warn('⚠️ Failed to get students list:', studentsRes.status);
        return null;
      }
      
      const studentsResult = await studentsRes.json();
      const totalStudents = studentsResult.data?.length || 0;
      console.log('📊 Total students in class:', totalStudents);
      
      // BƯỚC 2: Lấy danh sách học sinh vắng
      const dateObj = new Date(date);
      const attendanceApiUrl = `http://localhost:3000/api/attendance/class/${classId}/date/${dateObj.toISOString().split('T')[0]}`;
      console.log('📊 Step 2: Getting absent students:', attendanceApiUrl);
      
      const attendanceRes = await fetch(attendanceApiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Attendance response:', attendanceRes.status, attendanceRes.statusText);
      
      if (!attendanceRes.ok) {
        console.warn('⚠️ Failed to get attendance:', attendanceRes.status);
        // Nếu không có dữ liệu điểm danh = tất cả có mặt
        return { presentCount: totalStudents, totalCount: totalStudents };
      }
      
      const attendanceResult = await attendanceRes.json();
      console.log('📦 Attendance data:', attendanceResult);
      
      // Check if result is an array or has data property
      const attendanceRecords = Array.isArray(attendanceResult) ? attendanceResult : (attendanceResult.data || []);
      
      // Backend chỉ lưu học sinh VẮNG (Có phép, Không phép)
      // Nên số record = số học sinh vắng
      const absentCount = attendanceRecords.length;
      
      // Tính số có mặt = Tổng - Vắng
      const presentCount = totalStudents - absentCount;
      
      console.log('✅ Stats calculated:', { 
        totalStudents, 
        absentCount, 
        presentCount,
        formula: `${totalStudents} - ${absentCount} = ${presentCount}`
      });
      
      return { presentCount: presentCount, totalCount: totalStudents };
    } catch (error) {
      console.error('❌ Error getting attendance stats:', error);
      return null;
    }
  };

  const stats = getStatsForDate(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Title Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Danh sách lớp giáo vụ quản lý</h2>
              <p className="text-gray-600 text-sm">Lớp học có lịch ngày {formatDisplayDate(selectedDate)} - Chọn lớp để thực hiện điểm danh</p>
            </div>
            <Button
              onClick={onViewAllClasses}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Xem tất cả lớp
            </Button>
          </div>
        </div>

        {/* Stats Cards - Moved to top */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số lớp</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalClasses}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã điểm danh</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedClasses}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chưa điểm danh</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingClasses}</p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày điểm danh</p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-lg font-bold text-purple-600 bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Class Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Điểm danh ngày {formatDisplayDate(selectedDate)}
            </h3>
            {selectedDate !== new Date().toISOString().split('T')[0] && (
              <p className="text-sm text-gray-500 mt-1">
                Dữ liệu lịch sử điểm danh
              </p>
            )}
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Tên lớp
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Giáo viên chủ nhiệm
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Thời gian học
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Sĩ số
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Tên trường
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Trạng thái
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classInfo, index) => {
                const statusForDate = getClassStatusForDate(classInfo, selectedDate);
                return (
                  <tr key={classInfo.classId || index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 border-r border-gray-200">
                      <span className="text-blue-600 font-medium">{classInfo.className}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-200">
                      {classInfo.homeRoomTeacher}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Thứ 2 - Thứ 7</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          <AttendanceDisplay 
                            classInfo={classInfo} 
                            statusForDate={statusForDate} 
                            selectedDate={selectedDate}
                            getAttendanceStatsForClass={getAttendanceStatsForClass}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center border-r border-gray-200">
                      <span className="text-sm font-medium text-gray-900">{classInfo.academicYear}</span>
                    </td>
                    <td className="py-4 px-6 text-center border-r border-gray-200">
                      {getStatusBadge(statusForDate)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {statusForDate === 'completed' ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-green-600 font-medium">Đã xác nhận</span>
                          <Button
                            onClick={() => onSelectClass(classInfo.classId, selectedDate)}
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 px-3 py-1 text-xs"
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      ) : (() => {
                        // Kiểm tra xem có thể điểm danh không
                        const today = new Date().toISOString().split('T')[0];
                        const todayObj = new Date(today);
                        const selectedDateObj = new Date(selectedDate);
                        
                        // Không cho phép điểm danh ngày tương lai
                        if (selectedDate > today) {
                          return (
                            <span className="text-sm text-gray-500">
                              Chưa tới ngày
                            </span>
                          );
                        }
                        
                        // Tính số ngày chênh lệch
                        const diffTime = todayObj.getTime() - selectedDateObj.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        // Cho phép điểm danh trong vòng 1 ngày (hôm nay hoặc hôm qua)
                        const canEdit = diffDays >= 0 && diffDays <= 1;
                        
                        if (canEdit) {
                          return (
                            <Button
                              onClick={() => onSelectClass(classInfo.classId, selectedDate)}
                              className="bg-cyan-900 hover:bg-cyan-800 text-white px-4 py-2 text-sm"
                            >
                              {selectedDate === today ? 'Điểm danh' : 'Điểm danh (Hôm qua)'}
                            </Button>
                          );
                        } else {
                          return (
                            <span className="text-sm text-gray-500">
                              Quá hạn điểm danh
                            </span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}