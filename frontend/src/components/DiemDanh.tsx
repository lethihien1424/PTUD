import { useState } from 'react';
import { ClassList } from './ClassList';
import { AttendanceManagement } from './Điemanh_Management';
import { AllClassesList } from './AllClassesList';

type ViewType = 'attendance' | 'all-classes' | 'attendance-detail';

export function AttendanceApp() {
  const [currentView, setCurrentView] = useState<ViewType>('attendance');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedClasses, setCompletedClasses] = useState<Set<string>>(new Set());

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
    // Không reset selectedDate khi quay lại, giữ nguyên ngày đã chọn
  };

  const handleBackToAllClasses = () => {
    setCurrentView('all-classes');
  };

  const handleAttendanceComplete = (classId: string) => {
    setCompletedClasses(prev => new Set([...prev, classId]));
    setSelectedClass(null); // Quay về danh sách lớp sau khi xác nhận
    setCurrentView('attendance');
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
      />
    );
  }

  return (
    <ClassList 
      onSelectClass={handleSelectClass} 
      completedClasses={completedClasses}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onViewAllClasses={() => handleViewChange('all-classes')}
    />
  );
}