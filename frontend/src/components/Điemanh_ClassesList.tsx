import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, BookOpen, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AttendanceService } from '../services/attendanceService';

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

interface AllClassesListProps {
  onBack: () => void;
  onSelectClass: (classId: string, date?: string) => void;
}

export function AllClassesList({ onBack, onSelectClass }: AllClassesListProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all classes from database
  useEffect(() => {
    loadAllClasses();
  }, []);

  const loadAllClasses = async () => {
    try {
      setLoading(true);
      const dbClasses = await AttendanceService.getAllClasses();
      
      const classesData: ClassInfo[] = dbClasses.map(dbClass => ({
        classId: dbClass.classId,
        className: dbClass.className,
        homeRoomTeacher: dbClass.homeRoomTeacher,
        schedule: `${dbClass.schedule?.days?.join(', ') || 'N/A'} (${dbClass.schedule?.timeSlot || 'N/A'})`,
        currentStudents: dbClass.currentStudents,
        maxStudents: dbClass.maxStudents,
        academicYear: dbClass.academicYear,
        status: 'active' as const
      }));

      setClasses(classesData);
    } catch (error) {
      console.error('Error loading all classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classInfo =>
    classInfo.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classInfo.homeRoomTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classInfo.classId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatScheduleDays = (schedule: string) => {
    const dayMap: Record<string, string> = {
      'monday': 'T2',
      'tuesday': 'T3', 
      'wednesday': 'T4',
      'thursday': 'T5',
      'friday': 'T6',
      'saturday': 'T7',
      'sunday': 'CN'
    };
    
    // Extract days from schedule string
    const daysMatch = schedule.match(/([^(]+)/);
    if (daysMatch) {
      const daysStr = daysMatch[1].trim();
      const days = daysStr.split(', ');
      const vietnameseDays = days.map(day => dayMap[day.trim()] || day);
      return vietnameseDays.join(', ');
    }
    return schedule;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Đang tải danh sách tất cả lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Back button */}
          <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600 text-sm hover:text-blue-600">Quay lại điểm danh</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tất cả lớp học giáo vụ quản lý</h2>
              <p className="text-gray-600 text-sm">Danh sách đầy đủ các lớp học trong năm học 2024-2025</p>
            </div>
            
            {/* Search */}
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm lớp, giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số lớp</p>
                <p className="text-2xl font-bold text-blue-600">{filteredClasses.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredClasses.reduce((sum, cls) => sum + cls.currentStudents, 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Năm học</p>
                <p className="text-lg font-bold text-purple-600">2024-2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Danh sách lớp học ({filteredClasses.length} lớp)
            </h3>
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
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Lịch học
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Sĩ số (Hiện tại/Tối đa)
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-700 border-r border-gray-200">
                  Năm học
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
              {filteredClasses.map((classInfo) => (
                <tr key={classInfo.classId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 border-r border-gray-200">
                    <span className="text-blue-600 font-medium">{classInfo.className}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-200">
                    {classInfo.homeRoomTeacher}
                  </td>
                  <td className="py-4 px-6 text-center border-r border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{formatScheduleDays(classInfo.schedule)}</div>
                      <div className="text-xs text-gray-500">
                        {classInfo.schedule.match(/\(([^)]+)\)/)?.[1] || ''}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {classInfo.currentStudents}/{classInfo.maxStudents}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center border-r border-gray-200">
                    <span className="text-sm font-medium text-gray-900">{classInfo.academicYear}</span>
                  </td>
                  <td className="py-4 px-6 text-center border-r border-gray-200">
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      Hoạt động
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      onClick={() => onSelectClass(classInfo.classId)}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-1 text-xs"
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}