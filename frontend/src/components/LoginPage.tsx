import { useState } from 'react';
import { User, UserRole } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { GraduationCap, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sử dụng proxy Vite, gọi endpoint ngắn
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenDangNhap: username,
          matKhau: password,
        }),
      });

      // Kiểm tra kiểu dữ liệu trả về
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('Server trả về response không hợp lệ: ' + text);
      }

      if (!res.ok || !data.success) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        setLoading(false);
        return;
      }

      // ✅ Lấy thông tin user từ data.data.user
      const userInfo = data.data.user;
      const teacherInfo = data.data.teacherInfo;

      // ✅ Chuyển loaiTaiKhoan từ backend sang UserRole của App
      const roleMap: Record<string, UserRole> = {
        hocsinh: 'student',
        giaovien: 'teacher',
        gvcn: 'homeroom-teacher', // ✅ Sửa lại mapping cho GVCN
        bangiamhieu: 'principal',
        phuHuynh: 'parent',
        giaovu: 'academic-affairs',
        nvso: 'education-dept',
      };

      const mappedRole = roleMap[userInfo.loaiTaiKhoan] || 'student';

      // ✅ Tạo object user với thông tin đầy đủ  
      const loggedInUser: User = {
        id: userInfo.maTaiKhoan,
        name: userInfo.details?.hoTen || teacherInfo?.hoTen || userInfo.tenDangNhap,
        email: userInfo.details?.email || teacherInfo?.email || `${userInfo.tenDangNhap}@school.edu.vn`,
        role: mappedRole,
        loaiTaiKhoan: userInfo.loaiTaiKhoan, // Truyền đúng loại tài khoản từ backend
        details: userInfo.details, // phải có dòng này
      };

      // ✅ Lưu token và thông tin user vào localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // ✅ Gọi hàm cha để cập nhật state App
      onLogin(loggedInUser);

    } catch (err: any) {
      setError('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4" 
      style={{ 
        minHeight: '100vh',
        height: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '2rem'
      }}
    >
      <Card 
        className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-sm" 
        style={{ 
          maxWidth: '550px', 
          width: '100%',
          padding: '3rem 2.5rem',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="flex justify-center mb-4" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div 
              className="bg-blue-600 text-white p-4 rounded-2xl" 
              style={{ 
                backgroundColor: '#2563eb', 
                color: 'white', 
                padding: '1.25rem', 
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GraduationCap size={48} strokeWidth={2} />
            </div>
          </div>
          <h1 
            className="text-gray-900 mb-1" 
            style={{ 
              color: '#111827', 
              marginBottom: '0.5rem', 
              fontSize: '1.75rem', 
              fontWeight: '600',
              lineHeight: '1.2'
            }}
          >
            Hệ thống Quản lý Trường học
          </h1>
          <p 
            className="text-blue-600" 
            style={{ 
              color: '#2563eb', 
              fontSize: '0.9375rem',
              marginTop: '0.5rem'
            }}
          >
            Chào mừng bạn quay trở lại
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Label 
              htmlFor="username" 
              className="text-gray-700" 
              style={{ 
                color: '#374151', 
                fontSize: '0.9375rem',
                fontWeight: '500'
              }}
            >
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 bg-gray-50 border-gray-200"
              style={{ 
                height: '3rem', 
                backgroundColor: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                width: '100%'
              }}
              required
            />
          </div>

          <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Label 
              htmlFor="password" 
              className="text-gray-700" 
              style={{ 
                color: '#374151', 
                fontSize: '0.9375rem',
                fontWeight: '500'
              }}
            >
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-gray-50 border-gray-200"
              style={{ 
                height: '3rem', 
                backgroundColor: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                width: '100%'
              }}
              required
            />
          </div>

          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-2"
              style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                color: '#b91c1c', 
                padding: '0.875rem 1rem', 
                borderRadius: '0.5rem',
                fontSize: '0.9375rem'
              }}
            >
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white mt-6" 
            style={{ 
              width: '100%', 
              height: '3rem', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              borderRadius: '0.5rem', 
              marginTop: '2rem', 
              cursor: 'pointer', 
              border: 'none', 
              fontWeight: '500',
              fontSize: '1rem'
            }}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-6 text-center" style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <a 
            href="#" 
            className="text-blue-600 hover:underline" 
            style={{ 
              color: '#2563eb', 
              fontSize: '0.9375rem',
              textDecoration: 'none'
            }}
          >
            {/* Quên mật khẩu? */}
          </a>
        </div>

      </Card>
    </div>
  );
}