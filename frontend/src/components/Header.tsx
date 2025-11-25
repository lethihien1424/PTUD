import { User } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GraduationCap, LogOut, Menu, KeyRound, UserCircle, ChevronDown, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

function getRoleName(loaiTaiKhoan: string) {
  switch (loaiTaiKhoan) {
    case 'hocsinh': return 'Học sinh';
    case 'nvso': return 'Nhân viên Sở';
    case 'giaovien': return 'Giáo viên';
    case 'giaovu': return 'Giáo vụ';
    case 'bangiamhieu': return 'Ban giám hiệu';
    case 'phuhuynh': return 'Phụ huynh';
    case 'gvcn': return 'Giáo viên chủ nhiệm';
    default: return loaiTaiKhoan;
  }
}

export default function DashboardLayout({ user, onLogout, sidebar, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordMessage, setChangePasswordMessage] = useState<string>('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = async () => {
    setChangePasswordMessage('');
    if (newPassword !== confirmPassword) {
      setChangePasswordMessage('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordMessage('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChangePasswordMessage('Đổi mật khẩu thành công!');
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setChangePasswordMessage(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setChangePasswordMessage('Lỗi hệ thống!');
    }
  };

  const notifications = [
    { id: 1, title: 'Thông báo mới', message: 'Bạn có 3 phiếu sửa điểm cần duyệt', time: '5 phút trước', unread: true },
    { id: 2, title: 'Nhắc nhở', message: 'Hạn nộp bài tập môn Toán là ngày mai', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Cập nhật', message: 'Thời khóa biểu đã được cập nhật', time: '3 giờ trước', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  console.log('user.details:', user.details);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {sidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu size={20} />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <GraduationCap size={24} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-gray-900">Hệ thống Quản lý Trường học</h1>
                  <p className="text-gray-600">{getRoleName(user.loaiTaiKhoan)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-900 font-semibold">Thông báo</h3>
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500">
                            {unreadCount} mới
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.map(n => (
                        <button
                          key={n.id}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            n.unread ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              n.unread ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium mb-1">{n.title}</p>
                              <p className="text-gray-600 text-sm mb-1">{n.message}</p>
                              <p className="text-gray-500 text-xs">{n.time}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-gray-900 font-medium">{user.name}</p>
                    <p className="text-gray-600 text-sm">{getRoleName(user.loaiTaiKhoan)}</p>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsInfoOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <UserCircle size={18} />
                      <span>Thông tin cá nhân</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <KeyRound size={18} />
                      <span>Đổi mật khẩu</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dialog hiển thị thông tin cá nhân */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin cá nhân</DialogTitle>
            <DialogDescription>
              {user.loaiTaiKhoan === 'giaovien' && (
                <>
                  <div>Họ tên: {user.details?.hoTen || user.name}</div>
                  <div>Email: {user.details?.email || user.email}</div>
                  <div>Chuyên môn: {user.details?.chuyenMon}</div>
                  <div>Chức vụ: {user.details?.chucVu}</div>
                  <div>Địa chỉ: {user.details?.diaChi}</div>
                  {/* <div>Loại tài khoản: Giáo viên</div> */}
                </>
              )}
              {user.loaiTaiKhoan === 'gvcn' && (
                <>
                  <div>Họ tên: {user.details?.hoTen || user.name}</div>
                  <div>Email: {user.details?.email || user.email}</div>
                  <div>Chuyên môn: {user.details?.chuyenMon}</div>
                  <div>Chức vụ: {user.details?.chucVu}</div>
                  <div>Địa chỉ: {user.details?.diaChi}</div>
                  <div>Lớp chủ nhiệm: {user.details?.lopChuNhiem}</div>
                  <div>Khối: {user.details?.khoiChuNhiem}</div>
                  <div>Sĩ số lớp: {user.details?.siSoChuNhiem}</div>
                  <div>Trường: {user.details?.tenTruongChuNhiem}</div>
                </>
              )}
              {user.loaiTaiKhoan === 'hocsinh' && (
                <>
                  <div>Họ tên: {user.details?.hoTen || user.name}</div>
                  <div>Ngày sinh: {user.details?.ngaySinh}</div>
                  <div>Giới tính: {user.details?.gioiTinh}</div>
                  <div>Lớp: {user.details?.tenLop}</div>
                  <div>Địa chỉ: {user.details?.diaChi}</div>
                  <div>Tình trạng: {user.details?.tinhTrang}</div>
                  {/* <div>Loại tài khoản: Học sinh</div> */}
                </>
              )}
              {user.loaiTaiKhoan === 'nvso' && (
                <>
                  <div>Họ tên: {user.details?.hoTen || user.name}</div>
                  <div>Email: {user.details?.email || user.email}</div>
                  {/* <div>Loại tài khoản: Nhân viên Sở</div> */}
                </>
              )}
              {user.loaiTaiKhoan === 'phuhuynh' && (
                <>
                  <div>Họ tên: {user.details?.hoTen || user.name}</div>
                  <div>Email: {user.details?.email || user.email}</div>
                  <div>Số điện thoại: {user.details?.SDT}</div>
                  <div>Nghề nghiệp: {user.details?.ngheNghiep}</div>
                  {/* <div>Loại tài khoản: Phụ huynh</div> */}
                </>
              )}
       
              {/* Có thể bổ sung thêm các loại tài khoản khác tương tự */}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={20} className="text-blue-600" />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="h-11"
              />
            </div>
            {changePasswordMessage && (
              <div className={`mt-2 text-sm ${changePasswordMessage.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{changePasswordMessage}</div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Đổi mật khẩu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
              <div className="p-6">
                {sidebar}
              </div>
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
                <aside className="w-64 bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    {sidebar}
                  </div>
                </aside>
              </div>
            )}
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}