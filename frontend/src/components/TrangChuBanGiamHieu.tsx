import React, { useState, useEffect } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, FileText, UserCheck, Calendar, BookOpen } from 'lucide-react';
import TKBHS from "./LapThoiKhoaBieu";
import BaiTapHS from "./LamBaiTap";
import KQHocTap from "./KQHocTap";

interface PrincipalDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TrangChuBanGiamHieu({ user, onLogout }: PrincipalDashboardProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("principalActiveTab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("principalActiveTab", activeTab);
  }, [activeTab]);

  const menuItems = [
    { id: "dashboard", name: "Tổng quan", icon: TrendingUp },
    { id: "schedule", name: "Thời khóa biểu", icon: Calendar },
    { id: "grades", name: "Kết quả học tập", icon: BookOpen },
    { id: "homework", name: "Bài tập", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Trang chủ Ban Giám Hiệu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng số học sinh</p>
                    <p className="text-2xl font-bold text-blue-600">1,234</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng số giáo viên</p>
                    <p className="text-2xl font-bold text-green-600">89</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
                    <p className="text-2xl font-bold text-purple-600">42</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case "schedule":
        return <TKBHS />;
      case "homework":
        return <BaiTapHS />;
      case "grades":
        return <KQHocTap />;
      default:
        return null;
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