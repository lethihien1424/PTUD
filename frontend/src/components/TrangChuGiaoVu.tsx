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

import ClassManagement from "./ClassManagement";

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
    { id: "class-management", name: "Quản lý lớp", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "class-management":
        return <ClassManagement />;
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