import React, { useState, useEffect } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Users, UserCheck, ClipboardList, BookOpen, FileText } from 'lucide-react';

import DiemDanhGVCN from './DiemDanh_GVCN';

interface HomeroomTeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TrangChuGVCN({ user, onLogout }: HomeroomTeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("homeroomTeacherActiveTab") || "diemdanh";
  });

  useEffect(() => {
    localStorage.setItem("homeroomTeacherActiveTab", activeTab);
  }, [activeTab]);

  const menuItems = [
    { id: "diemdanh", name: "Xem danh lớp chủ nhiệm", icon: UserCheck },
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "diemdanh":
        return <DiemDanhGVCN user={user} />;
      case "ketqua":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Kết quả học tập</h2>
            <p className="text-gray-600">Chức năng đang phát triển...</p>
          </Card>
        );
      case "hocsinh":
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Quản lý học sinh</h2>
            <p className="text-gray-600">Chức năng đang phát triển...</p>
          </Card>
        );
      default:
        return <DiemDanhGVCN user={user} />;
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setActiveTab(item.id)}
        >
          <item.icon size={18} className="mr-2" />
          {item.name}
        </Button>
      ))}
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {renderContent()}
    </DashboardLayout>
  );
}