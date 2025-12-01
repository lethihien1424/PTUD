import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Users, Plus, Edit2, Trash2, Search, UserPlus, RefreshCw, Eye } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface Teacher {
  maGV: string;
  hoTen: string;
  email: string;
  CCCD: string;
  chuyenMon: string;
  chucVu: string;
  diaChi: string;
  SDT: string;
  ngayBatDau: string;
  ngayKetThuc?: string;
  trangThai: number;
  trangThaiText: string;
  tenDangNhap?: string;
  maTaiKhoan?: string;
}

interface NewTeacher {
  hoTen: string;
  email: string;
  CCCD: string;
  chuyenMon: string;
  chucVu: string;
  diaChi: string;
  SDT: string;
  ngayBatDau: string;
}

export function QLGV() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  
  // Filters
  const [filterChuyenMon, setFilterChuyenMon] = useState('');
  const [filterChucVu, setFilterChucVu] = useState('');

  const [newTeacher, setNewTeacher] = useState<NewTeacher>({
    hoTen: '',
    email: '',
    CCCD: '',
    chuyenMon: '',
    chucVu: 'GV',
    diaChi: '',
    SDT: '',
    ngayBatDau: new Date().toISOString().split('T')[0]
  });

  // Thống kê từ tất cả giáo viên (lấy riêng)
  const [allTeachersStats, setAllTeachersStats] = useState({ active: 0, inactive: 0 });

  // Load teachers from API
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        showInactive: showInactive.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterChuyenMon && filterChuyenMon !== 'all') params.append('chuyenMon', filterChuyenMon);
      if (filterChucVu && filterChucVu !== 'all') params.append('chucVu', filterChucVu);

      console.log('🔍 Đang gọi API với params:', {
        page: currentPage,
        limit: 20,
        showInactive: showInactive,
        searchTerm,
        filterChuyenMon,
        filterChucVu
      });

      const response = await fetch(`http://localhost:3000/api/teachers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách giáo viên');
      }

      const result = await response.json();
      console.log('✅ Kết quả từ API:', result);
      
      if (result.success) {
        setTeachers(result.data.teachers);
        setTotalPages(result.data.pagination.totalPages);
        
        // Debug: Đếm số giáo viên theo trạng thái trong trang hiện tại
        const activeInPage = result.data.teachers.filter(t => t.trangThai === 1).length;
        const inactiveInPage = result.data.teachers.filter(t => t.trangThai === 0).length;
        console.log('📄 Trong trang này:', {
          active: activeInPage,
          inactive: inactiveInPage,
          total: result.data.teachers.length
        });
      }
    } catch (error) {
      console.error('❌ Error loading teachers:', error);
      toast.error('Lỗi khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê tổng số (gọi riêng với showInactive=true để lấy tất cả)
  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/teachers?page=1&limit=1000&showInactive=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const active = result.data.teachers.filter(t => t.trangThai === 1).length;
          const inactive = result.data.teachers.filter(t => t.trangThai === 0).length;
          setAllTeachersStats({ active, inactive });
          console.log('📊 Thống kê tổng:', { active, inactive, total: active + inactive });
        }
      }
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadStatistics(); // Tải thống kê tổng
  }, [currentPage, showInactive, filterChuyenMon, filterChucVu, searchTerm]);

  // Add teacher
  const handleAddTeacher = async () => {
    if (!newTeacher.hoTen || !newTeacher.email || !newTeacher.CCCD || !newTeacher.chuyenMon || !newTeacher.SDT) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate họ tên
    const namePattern = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(\s[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;
    
    if (!namePattern.test(newTeacher.hoTen.trim())) {
      toast.error('❌ Họ tên không hợp lệ. Vui lòng viết hoa chữ cái đầu mỗi từ (VD: Nguyễn Văn An)');
      return;
    }

    // Kiểm tra tên không chứa viết tắt
    const abbreviationPattern = /\b[A-Z]{2,}\b/;
    if (abbreviationPattern.test(newTeacher.hoTen)) {
      toast.error('❌ Họ tên không được chứa chữ viết tắt (như VDD, GS, TS). Vui lòng nhập đầy đủ họ tên');
      return;
    }

    // Kiểm tra độ dài tên
    if (newTeacher.hoTen.trim().length < 3 || newTeacher.hoTen.trim().length > 50) {
      toast.error('❌ Họ tên phải từ 3 đến 50 ký tự');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTeacher.email)) {
      toast.error('❌ Email không hợp lệ');
      return;
    }

    // Validate CCCD (12 digits)
    if (!/^\d{12}$/.test(newTeacher.CCCD)) {
      toast.error('❌ CCCD phải có đúng 12 chữ số');
      return;
    }

    // Validate SDT (10 digits)
    if (!/^\d{10}$/.test(newTeacher.SDT)) {
      toast.error('❌ Số điện thoại phải có đúng 10 chữ số');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/teachers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeacher)
      });

      const result = await response.json();

      if (!response.ok) {
        // Hiển thị lỗi từ backend (bao gồm lỗi trùng lặp)
        throw new Error(result.message || 'Không thể thêm giáo viên');
      }

      if (result.success) {
        toast.success(
          <div>
            <p className="font-bold">✅ Thêm giáo viên thành công!</p>
            <p className="text-sm mt-1">Tài khoản đăng nhập:</p>
            <p className="text-sm">👤 Username: <strong>{result.data.account.tenDangNhap}</strong></p>
            <p className="text-sm">🔑 Password: <strong>123456</strong></p>
            <p className="text-xs text-yellow-600 mt-1">⚠️ Mật khẩu mặc định là <b>123456</b>. Vui lòng thông báo cho giáo viên đổi mật khẩu sau khi đăng nhập.</p>
          </div>,
          { duration: 8000 }
        );
        
        setNewTeacher({
          hoTen: '',
          email: '',
          CCCD: '',
          chuyenMon: '',
          chucVu: 'GV',
          diaChi: '',
          SDT: '',
          ngayBatDau: new Date().toISOString().split('T')[0]
        });
        setIsAddDialogOpen(false);
        loadTeachers();
        loadStatistics(); // Cập nhật lại thống kê
      }
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast.error(error.message || 'Lỗi khi thêm giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Update teacher
  const handleEditTeacher = async () => {
    if (!editingTeacher) return;

    if (!editingTeacher.hoTen || !editingTeacher.email || !editingTeacher.CCCD || !editingTeacher.chuyenMon || !editingTeacher.SDT) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate họ tên
    const namePattern = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(\s[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;
    
    if (!namePattern.test(editingTeacher.hoTen.trim())) {
      toast.error('❌ Họ tên không hợp lệ. Vui lòng viết hoa chữ cái đầu mỗi từ (VD: Nguyễn Văn An)');
      return;
    }

    // Kiểm tra tên không chứa viết tắt
    const abbreviationPattern = /\b[A-Z]{2,}\b/;
    if (abbreviationPattern.test(editingTeacher.hoTen)) {
      toast.error('❌ Họ tên không được chứa chữ viết tắt (như VDD, GS, TS). Vui lòng nhập đầy đủ họ tên');
      return;
    }

    // Kiểm tra độ dài tên
    if (editingTeacher.hoTen.trim().length < 3 || editingTeacher.hoTen.trim().length > 50) {
      toast.error('❌ Họ tên phải từ 3 đến 50 ký tự');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingTeacher.email)) {
      toast.error('❌ Email không hợp lệ');
      return;
    }

    // Validate CCCD (12 digits)
    if (!/^\d{12}$/.test(editingTeacher.CCCD)) {
      toast.error('❌ CCCD phải có đúng 12 chữ số');
      return;
    }

    // Validate SDT (10 digits)
    if (!/^\d{10}$/.test(editingTeacher.SDT)) {
      toast.error('❌ Số điện thoại phải có đúng 10 chữ số');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/teachers/${editingTeacher.maGV}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hoTen: editingTeacher.hoTen,
          email: editingTeacher.email,
          CCCD: editingTeacher.CCCD,
          chuyenMon: editingTeacher.chuyenMon,
          chucVu: editingTeacher.chucVu,
          diaChi: editingTeacher.diaChi,
          SDT: editingTeacher.SDT
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Hiển thị lỗi từ backend (bao gồm lỗi trùng lặp)
        throw new Error(result.message || 'Không thể cập nhật giáo viên');
      }

      if (result.success) {
        toast.success('✅ Cập nhật thông tin giáo viên thành công!');
        setEditingTeacher(null);
        setIsEditDialogOpen(false);
        loadTeachers();
      }
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast.error(error.message || 'Lỗi khi cập nhật giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher (soft delete)
  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Bạn có chắc chắn muốn cho giáo viên "${teacher.hoTen}" nghỉ việc?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/teachers/${teacher.maGV}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không thể cho giáo viên nghỉ việc');
      }

      if (result.success) {
        toast.success('✅ Đã cập nhật trạng thái nghỉ việc cho giáo viên');
        loadTeachers();
      }
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast.error(error.message || 'Lỗi khi cho giáo viên nghỉ việc');
    } finally {
      setLoading(false);
    }
  };

  // Reactivate teacher
  const handleReactivateTeacher = async (teacher: Teacher) => {
    if (!confirm(`Bạn có chắc chắn muốn tái kích hoạt giáo viên "${teacher.hoTen}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/teachers/${teacher.maGV}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không thể tái kích hoạt giáo viên');
      }

      if (result.success) {
        toast.success('✅ Tái kích hoạt giáo viên thành công!');
        loadTeachers();
      }
    } catch (error: any) {
      console.error('Error reactivating teacher:', error);
      toast.error(error.message || 'Lỗi khi tái kích hoạt giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number, statusText: string) => {
    if (status === 1) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Đang làm việc</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Đã nghỉ việc</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý giáo viên</h1>
        <p className="text-gray-600">Quản lý thông tin và phân công giáo viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số giáo viên</p>
              <p className="text-2xl font-bold text-blue-600">{teachers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang làm việc</p>
              <p className="text-2xl font-bold text-green-600">{allTeachersStats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã nghỉ việc</p>
              <p className="text-2xl font-bold text-red-600">{allTeachersStats.inactive}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterChuyenMon} onValueChange={setFilterChuyenMon}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo chuyên môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên môn</SelectItem>
              <SelectItem value="Toán">Toán</SelectItem>
              <SelectItem value="Văn">Văn</SelectItem>
              <SelectItem value="Anh">Tiếng Anh</SelectItem>
              <SelectItem value="Lý">Vật lý</SelectItem>
              <SelectItem value="Hóa">Hóa học</SelectItem>
              <SelectItem value="Sinh">Sinh học</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterChucVu} onValueChange={setFilterChucVu}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo chức vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chức vụ</SelectItem>
              <SelectItem value="GV">Giáo viên</SelectItem>
              <SelectItem value="GVCN">Giáo viên chủ nhiệm</SelectItem>
              <SelectItem value="GVBM">Giáo viên bộ môn</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setShowInactive(!showInactive);
                setCurrentPage(1); // Reset về trang 1 khi toggle
              }} 
              variant="outline"
              className="flex-1"
            >
              {showInactive ? 'Ẩn đã nghỉ việc' : 'Hiện đã nghỉ việc'}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Thêm GV
            </Button>
          </div>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Chuyên môn</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>SDT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.maGV}>
                    <TableCell className="font-medium">{teacher.maGV}</TableCell>
                    <TableCell>{teacher.hoTen}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.chuyenMon}</TableCell>
                    <TableCell>{teacher.chucVu}</TableCell>
                    <TableCell>{teacher.SDT}</TableCell>
                    <TableCell>{getStatusBadge(teacher.trangThai, teacher.trangThaiText)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingTeacher(teacher);
                            setIsDetailDialogOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </Button>
                        {teacher.trangThai === 1 ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTeacher(teacher);
                                setIsEditDialogOpen(true);
                              }}
                              title="Sửa"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher)}
                              title="Cho nghỉ việc"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivateTeacher(teacher)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            title="Tái kích hoạt"
                          >
                            <RefreshCw size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add Teacher Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm giáo viên mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin giáo viên mới. Tài khoản sẽ được tạo tự động.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ten">Họ tên <span className="text-red-500">*</span></Label>
              <Input
                id="ten"
                value={newTeacher.hoTen}
                onChange={(e) => setNewTeacher({...newTeacher, hoTen: e.target.value})}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                placeholder="giaovien@school.edu.vn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cccd">CCCD <span className="text-red-500">*</span></Label>
              <Input
                id="cccd"
                value={newTeacher.CCCD}
                onChange={(e) => setNewTeacher({...newTeacher, CCCD: e.target.value})}
                placeholder="123456789012"
                maxLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sdt">Số điện thoại <span className="text-red-500">*</span></Label>
              <Input
                id="sdt"
                value={newTeacher.SDT}
                onChange={(e) => setNewTeacher({...newTeacher, SDT: e.target.value})}
                placeholder="0123456789"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chuyenmon">Chuyên môn <span className="text-red-500">*</span></Label>
              <Select value={newTeacher.chuyenMon} onValueChange={(value) => setNewTeacher({...newTeacher, chuyenMon: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuyên môn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toán">Toán</SelectItem>
                  <SelectItem value="Văn">Văn</SelectItem>
                  <SelectItem value="Anh">Tiếng Anh</SelectItem>
                  <SelectItem value="Lý">Vật lý</SelectItem>
                  <SelectItem value="Hóa">Hóa học</SelectItem>
                  <SelectItem value="Sinh">Sinh học</SelectItem>
                  <SelectItem value="Sử">Lịch sử</SelectItem>
                  <SelectItem value="Địa">Địa lý</SelectItem>
                  <SelectItem value="GDCD">GDCD</SelectItem>
                  <SelectItem value="Tin">Tin học</SelectItem>
                  <SelectItem value="TD">Thể dục</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chucvu">Chức vụ</Label>
              <Select value={newTeacher.chucVu} onValueChange={(value) => setNewTeacher({...newTeacher, chucVu: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GV">Giáo viên</SelectItem>
                  <SelectItem value="GVCM">Giáo viên chủ nhiệm</SelectItem>
                  <SelectItem value="GVBM">Giáo viên bộ môn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngaybatdau">Ngày bắt đầu</Label>
              <Input
                id="ngaybatdau"
                type="date"
                value={newTeacher.ngayBatDau}
                onChange={(e) => setNewTeacher({...newTeacher, ngayBatDau: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="diachi">Địa chỉ</Label>
              <Textarea
                id="diachi"
                value={newTeacher.diaChi}
                onChange={(e) => setNewTeacher({...newTeacher, diaChi: e.target.value})}
                placeholder="Nhập địa chỉ"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddTeacher} disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm giáo viên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa thông tin giáo viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giáo viên
            </DialogDescription>
          </DialogHeader>
          {editingTeacher && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ten">Họ tên</Label>
                <Input
                  id="edit-ten"
                  value={editingTeacher.hoTen}
                  onChange={(e) => setEditingTeacher({...editingTeacher, hoTen: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cccd">CCCD</Label>
                <Input
                  id="edit-cccd"
                  value={editingTeacher.CCCD}
                  onChange={(e) => setEditingTeacher({...editingTeacher, CCCD: e.target.value})}
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sdt">Số điện thoại</Label>
                <Input
                  id="edit-sdt"
                  value={editingTeacher.SDT}
                  onChange={(e) => setEditingTeacher({...editingTeacher, SDT: e.target.value})}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-chuyenmon">Chuyên môn</Label>
                <Select value={editingTeacher.chuyenMon} onValueChange={(value) => setEditingTeacher({...editingTeacher, chuyenMon: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toán">Toán</SelectItem>
                    <SelectItem value="Văn">Văn</SelectItem>
                    <SelectItem value="Anh">Tiếng Anh</SelectItem>
                    <SelectItem value="Lý">Vật lý</SelectItem>
                    <SelectItem value="Hóa">Hóa học</SelectItem>
                    <SelectItem value="Sinh">Sinh học</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-chucvu">Chức vụ</Label>
                <Select value={editingTeacher.chucVu} onValueChange={(value) => setEditingTeacher({...editingTeacher, chucVu: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GV">Giáo viên</SelectItem>
                    <SelectItem value="GVCM">Giáo viên chủ nhiệm</SelectItem>
                    <SelectItem value="GVBM">Giáo viên bộ môn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-diachi">Địa chỉ</Label>
                <Textarea
                  id="edit-diachi"
                  value={editingTeacher.diaChi}
                  onChange={(e) => setEditingTeacher({...editingTeacher, diaChi: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditTeacher} disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Teacher Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết giáo viên</DialogTitle>
          </DialogHeader>
          {viewingTeacher && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-600">Mã giáo viên:</p>
                <p className="text-sm font-medium">{viewingTeacher.maGV}</p>
                
                <p className="text-sm text-gray-600">Họ tên:</p>
                <p className="text-sm font-medium">{viewingTeacher.hoTen}</p>
                
                <p className="text-sm text-gray-600">Email:</p>
                <p className="text-sm font-medium">{viewingTeacher.email}</p>
                
                <p className="text-sm text-gray-600">CCCD:</p>
                <p className="text-sm font-medium">{viewingTeacher.CCCD}</p>
                
                <p className="text-sm text-gray-600">Số điện thoại:</p>
                <p className="text-sm font-medium">{viewingTeacher.SDT}</p>
                
                <p className="text-sm text-gray-600">Chuyên môn:</p>
                <p className="text-sm font-medium">{viewingTeacher.chuyenMon}</p>
                
                <p className="text-sm text-gray-600">Chức vụ:</p>
                <p className="text-sm font-medium">{viewingTeacher.chucVu}</p>
                
                <p className="text-sm text-gray-600">Ngày bắt đầu:</p>
                <p className="text-sm font-medium">{new Date(viewingTeacher.ngayBatDau).toLocaleDateString('vi-VN')}</p>
                
                <p className="text-sm text-gray-600">Trạng thái:</p>
                <div>{getStatusBadge(viewingTeacher.trangThai, viewingTeacher.trangThaiText)}</div>
                
                {viewingTeacher.tenDangNhap && (
                  <>
                    <p className="text-sm text-gray-600">Tên đăng nhập:</p>
                    <p className="text-sm font-medium">{viewingTeacher.tenDangNhap}</p>
                  </>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Địa chỉ:</p>
                <p className="text-sm font-medium mt-1">{viewingTeacher.diaChi}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}