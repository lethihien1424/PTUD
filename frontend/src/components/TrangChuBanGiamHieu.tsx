import React, { useState, useEffect } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Users, UserCheck, ClipboardList, BookOpen, FileText, Layers } from 'lucide-react';

// Import các trang chức năng

import TeacherAssignmentSystem from './TeacherAssignmentSystem'; // <--- 1. IMPORT COMPONENT PHÂN CÔNG
import GradeRequests from './GradeRequests'; // <--- IMPORT GIAO DIỆN DUYỆT PHIẾU SỬA ĐIỂM

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("studentActiveTab") || "schedule";
  });

  useEffect(() => {
    localStorage.setItem("studentActiveTab", activeTab);
  }, [activeTab]);

  // 2. THÊM MỤC MENU "PHÂN CÔNG GIÁO VIÊN"
  const menuItems = [
    { id: "schedule", name: "BAN GIAM HIEU", icon: Calendar },
    { id: "assignments", name: "Phân công chuyên môn", icon: Layers }, // <--- Thêm dòng này
    { id: "gradeRequests", name: "Duyệt phiếu sửa điểm", icon: ClipboardList },
  ];

  // 3. THÊM CASE HIỂN THỊ GIAO DIỆN
  const renderContent = () => {
    switch (activeTab) {
      
      case "assignments": // <--- Khi bấm menu Phân công thì hiện trang này
        return <TeacherAssignmentSystem />;

      case "gradeRequests":
        return <GradeRequests />;

    }
  };

  const sidebar = (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "default" : "ghost"}
          className={`w-full justify-start ${activeTab === item.id ? "bg-blue-600 text-white" : ""}`}
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