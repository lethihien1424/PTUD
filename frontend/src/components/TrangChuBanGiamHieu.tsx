import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, FileText, UserCheck } from 'lucide-react';
import TKBHS from "./LapThoiKhoaBieu";
import BaiTapHS from "./LamBaiTap";
import KQHocTap from "./KQHocTap";

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

  const menuItems = [
    { id: "schedule", name: "Thời khóa biểu", icon: Calendar },
    { id: "grades", name: "Kết quả học tập", icon: BookOpen },
    { id: "homework", name: "Bài tập", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <TKBHS />;
      case "homework":
        return <BaiTapHS />;
      case "conduct":
        return <KQHocTap />;
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