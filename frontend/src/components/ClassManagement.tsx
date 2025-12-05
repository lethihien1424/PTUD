import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Search, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/classes';
const SUPPORT_DATA_URL = 'http://localhost:3000/api/classes/support-data';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return { headers: {} };
  return { headers: { Authorization: `Bearer ${token}` } };
};

interface Teacher {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  grade: number;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  subjectCombination?: string;
  createdDate: string;
}

interface ClassFormData {
  name: string;
  grade: string;
  homeroomTeacherId: string;
  studentCount: string;
  subjectCombination: string;
}

const grades = ['10', '11', '12'];
const subjectCombinations = ['Tự nhiên', 'Xã hội'];

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '',
    homeroomTeacherId: '',
    studentCount: '',
    subjectCombination: '',
  });

  // Fetch classes and teachers
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
        setIsLoading(false);
        return;
      }

      const [classesRes, supportRes] = await Promise.all([
        axios.get(API_URL, getAuthHeader()),
        axios.get(SUPPORT_DATA_URL, getAuthHeader()),
      ]);

      // Backend wraps results under { success, data }
      const classesRaw = classesRes.data?.data || classesRes.data || [];
      const teachersRaw = supportRes.data?.data?.teachers || supportRes.data?.data || supportRes.data || [];

      // Normalize teachers to { id, name }
      const teachersNormalized = teachersRaw.map((t: any) => ({
        id: t.maGV || t.maGiaoVien || t.id,
        name: t.hoTen || t.tenGiaoVien || t.name || String(t.maGV || t.id),
      }));

      // Normalize classes to match frontend `Class` interface
      const classesNormalized = classesRaw.map((c: any) => ({
        id: c.id || c.maLop || c.maLop,
        name: c.name || c.tenLop || c.tenLop,
        grade: Number(c.grade ?? c.khoi ?? 0),
        homeroomTeacherId: c.maGVChuNhiem || c.maGV || null,
        homeroomTeacherName: c.homeroomTeacher || c.tenGiaoVienChuNhiem || c.hoTen || '',
        studentCount: Number(c.studentCount ?? c.siSo ?? 0),
        subjectCombination: c.subjectCombination || c.toHopMon || '',
        createdDate: c.createdDate || null,
      }));

      setClasses(classesNormalized);
      setTeachers(teachersNormalized);
      toast.success('Tải dữ liệu thành công!');
    } catch (error: any) {
      console.error('Lỗi tải dữ liệu:', error);
      const errMsg = error.response?.data?.message || error.message || 'Lỗi server';
      toast.error('Lỗi khi tải dữ liệu: ' + errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeroomTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade.toString().includes(searchTerm)
  );

  // Add new class
  const handleAddClass = async () => {
    try {
      if (!formData.name || !formData.grade || !formData.homeroomTeacherId || !formData.studentCount) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Prevent duplicate class names (case-insensitive)
      const nameNormalized = formData.name.trim().toLowerCase();
      if (classes.some((c) => (c.name || '').trim().toLowerCase() === nameNormalized)) {
        toast.error('Tên lớp đã tồn tại. Vui lòng chọn tên khác.');
        return;
      }

      // Backend expects { khoi, maGVChuNhiem, siSo }
      const payload = {
        khoi: parseInt(formData.grade),
        maGVChuNhiem: formData.homeroomTeacherId,
        siSo: parseInt(formData.studentCount),
        tenLop: formData.name,
      };

      await axios.post(API_URL, payload, getAuthHeader());
      await fetchData();
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        grade: '',
        homeroomTeacherId: '',
        studentCount: '',
        subjectCombination: '',
      });
      toast.success('Thêm lớp thành công!');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Lỗi khi thêm lớp';
      toast.error(errMsg);
    }
  };

  // Update class
  const handleUpdateClass = async () => {
    try {
      if (!selectedClass) return;

      if (!formData.homeroomTeacherId || !formData.studentCount) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Backend update expects maGVChuNhiem and siSo
      const payload = {
        maGVChuNhiem: formData.homeroomTeacherId,
        siSo: parseInt(formData.studentCount),
      };

      await axios.put(`${API_URL}/${selectedClass.id}`, payload, getAuthHeader());
      await fetchData();
      setIsEditDialogOpen(false);
      setSelectedClass(null);
      toast.success('Cập nhật lớp thành công!');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Lỗi khi cập nhật lớp';
      toast.error(errMsg);
    }
  };

  // Delete class
  const handleDeleteClass = async () => {
    try {
      if (!selectedClass) return;

      await axios.delete(`${API_URL}/${selectedClass.id}`, getAuthHeader());
      await fetchData();
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
      toast.success('Xóa lớp thành công!');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Lỗi khi xóa lớp';
      toast.error(errMsg);
    }
  };

  const openEditDialog = (cls: Class) => {
    setSelectedClass(cls);
    setFormData({
      grade: cls.grade.toString(),
      homeroomTeacherId: cls.homeroomTeacherId,
      studentCount: cls.studentCount.toString(),
      subjectCombination: cls.subjectCombination || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (cls: Class) => {
    setSelectedClass(cls);
    setIsDeleteDialogOpen(true);
  };

  const openDetailDialog = (cls: Class) => {
    setSelectedClass(cls);
    setIsDetailDialogOpen(true);
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || '';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Quản lý lớp</h1>
        <p className="text-gray-600">Quản lý thông tin các lớp học trong trường</p>
      </div>

      {/* Search & Buttons */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp, giáo viên, khối..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              title="Xóa tìm kiếm"
            >
              <Search size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              grade: '',
              homeroomTeacherId: '',
              studentCount: '',
              subjectCombination: '',
            });
            setIsAddDialogOpen(true);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-colors font-medium">
          <Plus size={16} />
          Thêm lớp mới
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Danh sách lớp</h2>
          <p className="text-sm text-gray-600">Tổng số: {filteredClasses.length} lớp</p>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <AlertCircle size={48} className="text-gray-300 mb-3" />
            <p className="font-medium">Không tìm thấy lớp nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700 text-sm">STT</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Tên lớp</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Khối</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">GVCN</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Sĩ số</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Tổ hợp môn</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClasses.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                        {cls.name}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">Khối {cls.grade}</td>
                    <td className="p-4 text-sm text-gray-700">{cls.homeroomTeacherName}</td>
                    <td className="p-4 text-sm text-gray-700 font-medium">{cls.studentCount}</td>
                    <td className="p-4 text-sm text-gray-700">{cls.subjectCombination || '—'}</td>
                    <td className="p-4 text-sm text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openDetailDialog(cls)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditDialog(cls)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="Cập nhật"
                        >
                        
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(cls)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Class Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Thêm lớp mới</h2>
              <p className="text-sm text-gray-600 mt-1">Nhập thông tin lớp học mới</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khối <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Chọn khối</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Khối {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: 10A1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên chủ nhiệm <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Chọn giáo viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sĩ số <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Nhập sĩ số"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổ hợp môn</label>
                <select
                  value={formData.subjectCombination}
                  onChange={(e) => setFormData({ ...formData, subjectCombination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Chọn tổ hợp môn (tùy chọn)</option>
                  {subjectCombinations.map((combo) => (
                    <option key={combo} value={combo}>
                      {combo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
                <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-800 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddClass}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-colors font-medium">
                    Thêm lớp
                  </button>
                </div>
          </div>
        </div>
      )}

      {/* Edit Class Dialog */}
      {isEditDialogOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Cập nhật thông tin lớp</h2>
              <p className="text-sm text-gray-600 mt-1">Chỉnh sửa thông tin lớp {selectedClass.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                <input
                  type="text"
                  value={selectedClass.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khối</label>
                <input
                  type="text"
                  value={`Khối ${selectedClass.grade}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo viên chủ nhiệm <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Chọn giáo viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sĩ số <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổ hợp môn</label>
                <select
                  value={formData.subjectCombination}
                  onChange={(e) => setFormData({ ...formData, subjectCombination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Chọn tổ hợp môn (tùy chọn)</option>
                  {subjectCombinations.map((combo) => (
                    <option key={combo} value={combo}>
                      {combo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-800 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateClass}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-colors font-medium"

              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Xác nhận xóa lớp</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa lớp <strong>{selectedClass.name}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-800 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteClass}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-colors font-medium">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {isDetailDialogOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết lớp {selectedClass.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Thông tin đầy đủ về lớp học</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Tên lớp:</span>
                <span className="col-span-2 text-gray-800">{selectedClass.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Khối:</span>
                <span className="col-span-2 text-gray-800">Khối {selectedClass.grade}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">GVCN:</span>
                <span className="col-span-2 text-gray-800">{selectedClass.homeroomTeacherName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Sĩ số:</span>
                <span className="col-span-2 text-gray-800">{selectedClass.studentCount} học sinh</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Tổ hợp môn:</span>
                <span className="col-span-2 text-gray-800">{selectedClass.subjectCombination || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Ngày tạo:</span>
                <span className="col-span-2 text-gray-800">
                  {new Date(selectedClass.createdDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;
