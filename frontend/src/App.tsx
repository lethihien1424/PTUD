import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AccountLocked from './components/AccountLocked';
import TrangChuBanGiamHieu from './components/TrangChuBanGiamHieu';
import TrangChuGiaoVu from './components/TrangChuGiaoVu';
import TrangChuHocSinh from './components/TrangChuHocSinh';
import TrangChuPhuHuynh from './components/TrangChuPhuHuynh';
import TrangChuGiaoVien from './components/TrangChuGiaoVien';
import TrangChuGVCN from './components/TrangChuGVCN';
import TrangChuNhanVienSo from './components/TrangChuNhanVienSo';

export interface User {
  id?: string;
  name: string;
  role: 'hocsinh' | 'nvso' | 'giaovu' | 'bangiamhieu' | 'phuhuynh' | 'gvcn' | 'giaovien';
  loaiTaiKhoan: string;
  isLocked?: boolean;
  email?: string;
  details?: any;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAccountLocked, setIsAccountLocked] = useState(false);

  // Khi khởi động app, kiểm tra localStorage để giữ trạng thái đăng nhập
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.isLocked) {
        setIsAccountLocked(true);
      } else {
        setUser(parsedUser);
      }
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsAccountLocked(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleLogin = (userData: any) => {
    const userObj = {
      ...userData,
      loaiTaiKhoan: userData.loaiTaiKhoan,
    };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const handleAccountLocked = () => {
    setIsAccountLocked(true);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Hiển thị trang tài khoản bị khóa
  if (isAccountLocked) {
    return <AccountLocked />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onAccountLocked={handleAccountLocked} />;
  }

  // Sử dụng trực tiếp loaiTaiKhoan để chuyển hướng
  switch (user.loaiTaiKhoan) {
    case 'hocsinh':
      return <TrangChuHocSinh user={user} onLogout={handleLogout} />;
    case 'giaovien':
      return <TrangChuGiaoVien user={user} onLogout={handleLogout} />;
    case 'giaovu':
      return <TrangChuGiaoVu user={user} onLogout={handleLogout} />;
    case 'bangiamhieu':
      return <TrangChuBanGiamHieu user={user} onLogout={handleLogout} />;
    case 'phuhuynh':
      return <TrangChuPhuHuynh user={user} onLogout={handleLogout} />;
    case 'gvcn':
      return <TrangChuGVCN user={user} onLogout={handleLogout} />;
    case 'nvso':
      return <TrangChuNhanVienSo user={user} onLogout={handleLogout} />;
    default:
      return <div>Không xác định loại tài khoản!</div>;
  }
}
