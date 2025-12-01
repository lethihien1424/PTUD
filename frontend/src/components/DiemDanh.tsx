import React, { useState, useEffect } from 'react';
import { ClassList } from './DiemDanh_ClassListt';
import { AttendanceManagement } from './DiemDanh_Management';
import { AllClassesList } from './DiemDanh_ClassesList';

type ViewType = 'attendance' | 'all-classes' | 'attendance-detail';

export function AttendanceApp() {
  const [currentView, setCurrentView] = useState<ViewType>('attendance');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedClasses, setCompletedClasses] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Thêm key để force refresh

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSelectClass = (classId: string, date?: string) => {
    setSelectedClass(classId);
    setCurrentView('attendance-detail');
    // Lưu ngày được chọn từ ClassList
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBackToClassList = () => {
    setSelectedClass(null);
    setCurrentView('attendance');
    // Force refresh danh sách lớp để lấy dữ liệu mới nhất
    setRefreshKey(prev => prev + 1);
  };

  const handleBackToAllClasses = () => {
    setCurrentView('all-classes');
  };

  const handleAttendanceComplete = (classId: string) => {
    setCompletedClasses(prev => new Set([...prev, classId]));
    setSelectedClass(null); // Quay về danh sách lớp sau khi xác nhận
    setCurrentView('attendance');
    // Force refresh danh sách lớp sau khi hoàn thành điểm danh
    setRefreshKey(prev => prev + 1);
  };

  // Navigation
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedClass(null);
  };

  if (currentView === 'attendance-detail' && selectedClass) {
    return (
      <AttendanceManagement 
        classId={selectedClass} 
        selectedDate={selectedDate}
        onBack={handleBackToClassList}
        onAttendanceComplete={handleAttendanceComplete}
      />
    );
  }

  if (currentView === 'all-classes') {
    return (
      <AllClassesList 
        onBack={() => handleViewChange('attendance')}
        onSelectClass={handleSelectClass}
        user={user}
      />
    );
  }

  return (
    <ClassList 
      key={refreshKey}
      onSelectClass={handleSelectClass} 
      completedClasses={completedClasses}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onViewAllClasses={() => handleViewChange('all-classes')}
    />
  );
}