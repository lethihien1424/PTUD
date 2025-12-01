import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Lock, AlertTriangle, Mail, Phone } from 'lucide-react';

export default function AccountLocked() {
  const handleBackToLogin = () => {
    // Xóa dữ liệu lưu trữ
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Reload trang để quay về màn hình đăng nhập
    window.location.reload();
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
              className="bg-red-600 text-white p-4 rounded-2xl" 
              style={{ 
                backgroundColor: '#dc2626', 
                color: 'white', 
                padding: '1.25rem', 
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lock size={48} strokeWidth={2} />
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
            Tài khoản đã bị khóa
          </h1>
          
          <div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6"
            style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#b91c1c', 
              padding: '0.875rem 1rem', 
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              marginTop: '1.5rem'
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium mb-1">Tài khoản của bạn đã bị vô hiệu hóa</p>
                <p className="text-sm">
                  Tài khoản này hiện đang bị khóa và không thể đăng nhập vào hệ thống. 
                  Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div 
            className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg"
            style={{ 
              backgroundColor: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              color: '#1d4ed8', 
              padding: '0.875rem 1rem', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <p className="font-medium mb-2">Thông tin liên hệ:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>Email: admin@school.edu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>Hotline: 1900-xxxx</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleBackToLogin}
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
          >
            Quay lại trang đăng nhập
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
          <p>Hệ thống Quản lý Trường học</p>
          <p>© 2024 - Bảo mật và An toàn</p>
        </div>
      </Card>
    </div>
  );
}
