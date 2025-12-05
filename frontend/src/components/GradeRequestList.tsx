import React from 'react';
import { GradeRequest } from '../App';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Calendar, User } from 'lucide-react';

const gradeTypeLabels: Record<string, string> = {
  '15p': 'Kiểm tra 15p',
  '1t': 'Kiểm tra 1 tiết',
  'GK': 'Giữa kỳ',
  'CK': 'Cuối kỳ',
  'Miệng': 'Điểm miệng'
};

const gradeTypeColors: Record<string, string> = {
  '15p': 'bg-blue-100 text-blue-700 border-blue-200',
  '1t': 'bg-purple-100 text-purple-700 border-purple-200',
  'GK': 'bg-orange-100 text-orange-700 border-orange-200',
  'CK': 'bg-red-100 text-red-700 border-red-200',
  'Miệng': 'bg-green-100 text-green-700 border-green-200'
};

interface GradeRequestListProps {
  requests: GradeRequest[];
  selectedRequest: GradeRequest | null;
  onSelectRequest: (request: GradeRequest) => void;
}

export function GradeRequestList({ requests, selectedRequest, onSelectRequest }: GradeRequestListProps) {
  // Group requests by status for a compact overview
  const pending = requests.filter(r => r.status === 'Chờ duyệt' || String(r.status).toLowerCase() === 'pending');
  const approved = requests.filter(r => r.status === 'Đã duyệt' || String(r.status).toLowerCase() === 'approved');
  const rejected = requests.filter(r => r.status === 'Từ chối' || String(r.status).toLowerCase() === 'rejected' || String(r.status).toLowerCase() === 'reject');

  const renderItem = (request: GradeRequest) => {
    const isSelected = selectedRequest?.id === request.id;
    const itemBg = request.status === 'Chờ duyệt' || String(request.status).toLowerCase() === 'pending' ? 'bg-orange-50 border-orange-200' : request.status === 'Đã duyệt' || String(request.status).toLowerCase() === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    return (
      <div
        key={request.id}
        onClick={() => onSelectRequest(request)}
        className={`w-full cursor-pointer p-3 rounded-md border transition-shadow text-sm ${isSelected ? 'shadow-md ring-1 ring-blue-300' : ''} ${itemBg}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-800">{request.studentName}</div>
            <div className="text-gray-500 text-xs">{request.subject} • {request.studentId}</div>
          </div>

          <div className="text-right">
            <div className="text-gray-800">{request.oldGrade} → {request.newGrade}</div>
            <div className="text-gray-400 text-xs mt-1">{new Date(request.submittedDate).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, items }: { title: string; items: GradeRequest[] }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map(renderItem)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Danh Sách Phiếu</h2>
        <Badge variant="secondary">{requests.length}</Badge>
      </div>

      <div className="space-y-4">
        {pending.length > 0 && <Section title={`Chưa duyệt`} items={pending} />}
        {approved.length > 0 && <Section title={`Đã duyệt`} items={approved} />}
        {rejected.length > 0 && <Section title={`Từ chối`} items={rejected} />}

        {requests.length === 0 && (
          <Card className="p-4">
            <div className="text-center text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Không có phiếu trong danh sách</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
