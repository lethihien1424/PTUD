import React from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  grade: number;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  maPhanCong?: string;
  assignedTeacher?: { name: string; currentHours: number };
}

interface AssignmentTableProps {
  classes: Class[];
  onAssign: (classId: string, className: string, subjectId: string, subjectName: string, grade: number) => void;
  onDelete?: (maPhanCong: string) => void;
}

export function AssignmentTable({ classes, onAssign, onDelete }: AssignmentTableProps) {
  let allRows: Array<{
    classId: string;
    className: string;
    grade: number;
    subjectId: string;
    subjectName: string;
    maPhanCong?: string;
    assignedTeacher?: { name: string; currentHours: number };
  }> = [];

  classes.forEach(cls => {
    if (cls.subjects) {
      cls.subjects.forEach(subj => {
        allRows.push({
          classId: cls.id,
          className: cls.name,
          grade: cls.grade,
          subjectId: subj.id,
          subjectName: subj.name,
          maPhanCong: subj.maPhanCong,
          assignedTeacher: subj.assignedTeacher
        });
      });
    }
  });

  if (allRows.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center">
        <AlertCircle size={48} className="text-gray-300 mb-3" />
        <p className="font-medium">Không có môn học nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-4 font-semibold text-gray-700 text-sm">STT</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Lớp</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Khối</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Môn Học</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Trạng Thái</th>
            <th className="p-4 font-semibold text-gray-700 text-sm text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allRows.map((row, index) => (
            <tr key={`${row.classId}_${row.subjectId}`} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 text-sm text-gray-500 font-medium">{index + 1}</td>
              <td className="p-4 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                  {row.className}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-700">Khối {row.grade}</td>
              <td className="p-4 text-sm text-gray-700 font-medium">{row.subjectName}</td>
              <td className="p-4 text-sm">
                { (row.assignedTeacher || row.maPhanCong) ? (
                  <div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium block mb-1">
                      Đã phân công
                    </span>
                    {row.assignedTeacher ? (
                      <span className="text-xs text-gray-600">{row.assignedTeacher.name}</span>
                    ) : (
                      <span className="text-xs text-gray-600">(Giáo viên chưa được tải, mã PC: {row.maPhanCong})</span>
                    )}
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Chưa phân công
                  </span>
                )}
              </td>
              <td className="p-4 text-sm text-right">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => onAssign(row.classId, row.className, row.subjectId, row.subjectName, row.grade)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-semibold shadow-md"
                  >
                    <Plus size={16} />
                    {row.assignedTeacher ? 'Thay đổi' : 'Phân công'}
                  </button>
                  {onDelete && row.maPhanCong && (
                    <button
                      onClick={() => {
                        console.log('Delete button clicked, maPhanCong:', row.maPhanCong);
                        onDelete(row.maPhanCong!);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-semibold shadow-md"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssignmentTable;