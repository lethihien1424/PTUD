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

import { AttendanceApp } from './DiemDanh';
import { QLGV } from './QLGV';

interface AcademicAffairsDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TrangChuGiaoVu({ user, onLogout }: AcademicAffairsDashboardProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("academicAffairsActiveTab") || "teacher-management";
  });

  useEffect(() => {
    localStorage.setItem("academicAffairsActiveTab", activeTab);
  }, [activeTab]);

  const menuItems = [

    { id: "teacher-management", name: "Quản lý giáo viên", icon: Users },
    { id: "attendance", name: "Điểm danh", icon: UserCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "teacher-management":
        return <QLGV />;
      case "attendance":
        return <AttendanceApp />;
      default:
        return <QLGV />;
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

