import React, { useMemo } from 'react';
import { X, User, AlertCircle } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  specialization: string[];
  currentHours: number;
  maxHours: number;
  currentGrades: number[];
}

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    grade: number;
  } | null;
  onAssign: (teacher: Teacher) => void;
  teachers: Teacher[];
}

export function AssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onAssign,
  teachers
}: AssignmentDialogProps) {
  if (!open || !assignment) return null;

  // Lọc giáo viên có thể phân công: phải dạy môn, còn tiết, có khối phù hợp
  const availableTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // Kiểm tra chuyên môn (phải chứa tên môn)
      const teachesSubject = teacher.specialization.some(spec =>
        assignment.subjectName.toLowerCase().includes(spec.toLowerCase()) ||
        spec.toLowerCase().includes(assignment.subjectName.toLowerCase())
      );
      if (!teachesSubject) return false;

      // Kiểm tra số tiết (để < max)
      if (teacher.currentHours >= teacher.maxHours) return false;

      // Kiểm tra khối (nếu giáo viên có danh sách khối, phải chứa khối hiện tại)
      if (teacher.currentGrades.length > 0 && !teacher.currentGrades.includes(assignment.grade)) {
        return false;
      }

      return true;
    });
  }, [teachers, assignment]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Phân Công Giáo Viên</h2>
            <p className="text-sm text-gray-500 mt-1">
              {assignment.className} - {assignment.subjectName}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {availableTeachers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">Không có giáo viên phù hợp</p>
              <p className="text-sm text-gray-500 mt-2">
                Vui lòng kiểm tra chuyên môn hoặc số tiết của giáo viên.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableTeachers.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => {
                    onAssign(teacher);
                    onOpenChange(false);
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 group-hover:text-blue-700">
                        {teacher.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Chuyên môn: {teacher.specialization.join(', ')}
                      </p>
                      <div className="mt-2 flex gap-4 text-xs text-gray-600">
                        <span>Tiết: {teacher.currentHours}/{teacher.maxHours}</span>
                        <span>Khối: {teacher.currentGrades.length > 0 ? teacher.currentGrades.join(', ') : 'Không'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm group-hover:bg-blue-200">
                      {teacher.name.charAt(0)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDialog;
