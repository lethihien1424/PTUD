import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { BookOpen, Users, GraduationCap, Plus, X } from 'lucide-react';
import AssignmentTable from './AssignmentTable';
import AssignmentDialog from './AssignmentDialog';

const API_URL = 'http://localhost:3000/api/assignments';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return { headers: {} };
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Định nghĩa kiểu dữ liệu từ DB
interface Class {
  id: string;
  name: string;
  grade: number;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  maPhanCong?: string;
  assignedTeacher?: Teacher;
}

interface Teacher {
  id: string;
  name: string;
  specialization: string[];
  currentHours: number;
  maxHours: number;
  currentGrades: number[];
}

interface AssignmentRow {
  id: string;
  teacherName: string;
  teacherId: string;
  className: string;
  subjectName: string;
  currentHours?: number;
}

const SUBJECT_HOURS: { [key: string]: number } = {
  'Văn': 4, 'Toán': 4, 'Tiếng Anh': 3,
  'Vật lý': 2, 'Hóa học': 2, 'Sinh học': 2,
  'Lịch sử': 2, 'Địa lý': 2, 'GDCD': 1,
  'Tin học': 1, 'Công nghệ': 1, 'GDQP-AN': 1,
  'Giáo dục thể chất': 2, 'Hoạt động trải nghiệm': 1,
  'Giáo dục địa phương': 1
};

export function TeacherAssignmentSystem() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    grade: number;
  } | null>(null);

  // Lấy dữ liệu từ API backend
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
        setIsLoading(false);
        return;
      }

      const [dataRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/data`, getAuthHeader()),
        axios.get(`${API_URL}/teachers`, getAuthHeader())
      ]);

      const classesData = dataRes.data || [];
      setClasses(classesData);

      const teachersData = teachersRes.data || [];
      setTeachers(teachersData);

      // Xử lý tạo danh sách assignments (phẳng)
      const flatList: AssignmentRow[] = [];
      classesData.forEach((cls: Class) => {
        if (cls.subjects && Array.isArray(cls.subjects)) {
          cls.subjects.forEach((subj: Subject) => {
            // teacher info comes from assignedTeacher object; maPhanCong is assignment id (not teacher id)
            const teacherObj: Teacher | undefined = subj.assignedTeacher as any;
            if (teacherObj) {
              flatList.push({
                id: `${cls.id}_${subj.id}`,
                teacherName: teacherObj.name,
                teacherId: teacherObj.id,
                className: cls.name,
                subjectName: subj.name,
                currentHours: teacherObj.currentHours
              });
            }
          });
        }
      });
      setAssignments(flatList);

      toast.success('Tải dữ liệu thành công!');
    } catch (error: any) {
      console.error('Lỗi tải dữ liệu:', error);
      const errMsg = error.response?.data?.message || error.message || 'Lỗi server';
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else {
        toast.error('Lỗi khi tải dữ liệu: ' + errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mở dialog phân công
  const handleOpenAssignment = (
    classId: string,
    className: string,
    subjectId: string,
    subjectName: string,
    grade: number
  ) => {
    setSelectedAssignment({ classId, className, subjectId, subjectName, grade });
    setIsDialogOpen(true);
  };

  // Xử lý xóa phân công
  const handleDeleteAssignment = async (maPhanCong: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;

    try {
      await axios.delete(`${API_URL}/${maPhanCong}`, getAuthHeader());

      // Cập nhật classes - tìm và xóa maPhanCong từ assignedTeacher
      setClasses(prevClasses =>
        prevClasses.map(cls => ({
          ...cls,
          subjects: cls.subjects.map(subj => 
            subj.maPhanCong === maPhanCong
              ? { ...subj, maPhanCong: undefined, assignedTeacher: undefined }
              : subj
          )
        }))
      );

      toast.success('Xóa phân công thành công!');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Lỗi server';
      toast.error('Lỗi khi xóa phân công: ' + errMsg);
    }
  };

  // Xử lý chỉnh sửa phân công (mở dialog để thay đổi giáo viên)
  const handleEditAssignment = (
    classId: string,
    className: string,
    subjectId: string,
    subjectName: string,
    grade: number
  ) => {
    setSelectedAssignment({ classId, className, subjectId, subjectName, grade });
    setIsDialogOpen(true);
  };

  // Xử lý phân công giáo viên
  const handleAssignTeacher = async (teacher: Teacher) => {
    if (!selectedAssignment) return;

    try {
      // Tính số tiết của môn học
      const subjectHours = SUBJECT_HOURS[selectedAssignment.subjectName] || 1;

      // Gửi request tới backend
      const payload = {
        maGV: teacher.id,
        maLop: selectedAssignment.classId,
        maMonHoc: selectedAssignment.subjectId
      };

      await axios.post(API_URL, payload, getAuthHeader());

      // Cập nhật state local
      const updatedTeacher = {
        ...teacher,
        currentHours: teacher.currentHours + subjectHours,
        currentGrades: teacher.currentGrades.includes(selectedAssignment.grade)
          ? teacher.currentGrades
          : [...teacher.currentGrades, selectedAssignment.grade]
      };

      // Cập nhật classes
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === selectedAssignment.classId
            ? {
                ...cls,
                subjects: cls.subjects.map(subj =>
                  subj.id === selectedAssignment.subjectId
                    ? { ...subj, assignedTeacher: updatedTeacher }
                    : subj
                )
              }
            : cls
        )
      );

      // Cập nhật teachers
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t.id === teacher.id ? updatedTeacher : t
        )
      );

      toast.success('Phân công thành công!', {
        description: `${teacher.name} dạy ${selectedAssignment.subjectName} (${subjectHours} tiết) lớp ${selectedAssignment.className}`
      });

      setSelectedAssignment(null);
      setIsDialogOpen(false);
      
      // Fetch fresh data to show maPhanCong and enable delete button
      await fetchData();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Lỗi server';
      toast.error('Lỗi khi phân công: ' + errMsg);
    }
  };

  // Tính toán stats
  const getStats = () => {
    let totalSubjects = 0;
    let assignedSubjects = 0;

    classes.forEach(cls => {
      totalSubjects += cls.subjects?.length || 0;
      // count as assigned when either assignedTeacher object exists or maPhanCong id exists
      assignedSubjects += (cls.subjects?.filter(s => Boolean(s.assignedTeacher) || Boolean((s as any).maPhanCong))?.length || 0);
    });

    return {
      totalSubjects,
      assignedSubjects,
      unassignedSubjects: totalSubjects - assignedSubjects
    };
  };

  const stats = getStats();

  // Lọc assignments theo search text
  const filteredAssignments = assignments.filter(item =>
    item.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.className.toLowerCase().includes(searchText.toLowerCase()) ||
    item.subjectName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Build list of visible classes/subjects according to filters and search
  const visibleClasses = classes
    .filter(cls => (gradeFilter === 'all' ? true : String(cls.grade) === gradeFilter))
    .map(cls => ({
      ...cls,
        subjects: (cls.subjects || []).filter(subj => {
        // consider assigned if maPhanCong exists or assignedTeacher exists
        const isAssigned = Boolean(subj.assignedTeacher) || Boolean((subj as any).maPhanCong);
        if (statusFilter === 'assigned' && !isAssigned) return false;
        if (statusFilter === 'unassigned' && isAssigned) return false;

        // search filter: match class, subject, or teacher name
        const q = searchText.trim().toLowerCase();
        if (!q) return true;
        const classMatch = cls.name.toLowerCase().includes(q);
        const subjectMatch = subj.name.toLowerCase().includes(q);
        // teacher name may be in assignedTeacher object or stored as maPhanCong id -> resolve from teachers state
        const teacherNameFromAssign = subj.assignedTeacher?.name || '';
        const teacherMatch = teacherNameFromAssign.toLowerCase().includes(q);
        return classMatch || subjectMatch || teacherMatch;
      })
    }))
    .filter(cls => (cls.subjects || []).length > 0);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Phân công giáo viên</h1>
        <p className="text-gray-600">Quản lý phân công giáo viên cho các lớp học và môn học</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng môn học</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã phân công</p>
              <p className="text-2xl font-bold text-gray-800">{stats.assignedSubjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa phân công</p>
              <p className="text-2xl font-bold text-gray-800">{stats.unassignedSubjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Buttons */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm giáo viên, lớp, môn (nhập tên hoặc từ khóa)..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Phân công mới
            </button>
          </div>
        </div>

        {/* Filters: Grade (Khối) and Status (Trạng thái) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-700 mr-2">Lọc theo khối:</span>
              <button
                onClick={() => setGradeFilter('all')}
                aria-pressed={gradeFilter === 'all'}
                title="Tất cả khối"
                className={`px-3 py-1 rounded-full text-sm border min-w-[88px] whitespace-nowrap flex items-center justify-center ${gradeFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
              >
                <span>Tất cả</span>
              </button>
              {Array.from(new Set(classes.map(c => Number(c.grade))))
                .map(n => Number(n))
                .filter(n => !isNaN(n))
                .sort((a: number, b: number) => a - b)
                .map(g => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(String(g))}
                    aria-pressed={gradeFilter === String(g)}
                    title={`Khối ${g}`}
                    className={`px-3 py-1 rounded-full text-sm border min-w-[88px] whitespace-nowrap flex items-center justify-center ${gradeFilter === String(g) ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
                  >
                    <span>Khối {g}</span>
                  </button>
                ))}
            </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700 mr-2">Trạng thái:</span>
            <button
              onClick={() => setStatusFilter('all')}
              aria-pressed={statusFilter === 'all'}
              title="Tất cả trạng thái"
              className={`px-3 py-1 rounded-full text-sm border min-w-[110px] whitespace-nowrap flex items-center justify-center ${statusFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
            >
              <span>Tất cả</span>
            </button>
            <button
              onClick={() => setStatusFilter('assigned')}
              aria-pressed={statusFilter === 'assigned'}
              title="Đã phân công"
              className={`px-3 py-1 rounded-full text-sm border min-w-[110px] whitespace-nowrap flex items-center justify-center ${statusFilter === 'assigned' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
            >
              <span>Đã phân công</span>
            </button>
            <button
              onClick={() => setStatusFilter('unassigned')}
              aria-pressed={statusFilter === 'unassigned'}
              title="Chưa phân công"
              className={`px-3 py-1 rounded-full text-sm border min-w-[110px] whitespace-nowrap flex items-center justify-center ${statusFilter === 'unassigned' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
            >
              <span>Chưa phân công</span>
            </button>
          </div>
        </div>
      </div>
      {/* Assignment Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <AssignmentTable
          classes={visibleClasses}
          onAssign={handleOpenAssignment}
          onDelete={handleDeleteAssignment}
        />
      </div>

      {/* Assignment Dialog */}
      {isDialogOpen && (
        <AssignmentDialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setIsDialogOpen(false);
              setSelectedAssignment(null);
            }
          }}
          assignment={selectedAssignment}
          onAssign={handleAssignTeacher}
          teachers={teachers}
        />
      )}
    </div>
  );
}

export default TeacherAssignmentSystem;