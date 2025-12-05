import React from 'react';
import { GradeRequest } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, BookOpen, Calendar, FileText, TrendingUp, CheckCircle, XCircle, Paperclip, ClipboardList } from 'lucide-react';

// Map DB enum values to labels/colors
const gradeTypeLabels: Record<string, string> = {
  'diem15p': 'Kiểm tra 15 phút',
  'diem1tiet': 'Kiểm tra 1 tiết',
  'diemGK': 'Giữa kỳ',
  'diemCK': 'Cuối kỳ',
  'diemMieng': 'Điểm miệng'
};

const gradeTypeColors: Record<string, string> = {
  'diem15p': 'bg-blue-100 text-blue-700 border-blue-200',
  'diem1tiet': 'bg-purple-100 text-purple-700 border-purple-200',
  'diemGK': 'bg-orange-100 text-orange-700 border-orange-200',
  'diemCK': 'bg-red-100 text-red-700 border-red-200',
  'diemMieng': 'bg-green-100 text-green-700 border-green-200'
};

interface GradeRequestDetailProps {
  request: GradeRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isProcessing: boolean;
}

export function GradeRequestDetail({ request, onApprove, onReject, isProcessing }: GradeRequestDetailProps) {
  // Accept both backend english statuses and localized Vietnamese labels
  const isPending = request.status === 'pending' || request.status === 'Chờ duyệt' || String(request.status).toLowerCase() === 'pending';
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="mb-2">Chi Tiết Phiếu Sửa Điểm</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Mã phiếu:</span>
              <span className="text-blue-600">{request.id}</span>
              {request.status === 'pending' && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Chờ duyệt
                </Badge>
              )}
              {request.status === 'approved' && (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                  Đã duyệt
                </Badge>
              )}
              {request.status === 'rejected' && (
                <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
                  Đã từ chối
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Student Information */}
        <div className="space-y-4">
          <h3 className="text-gray-700">Thông Tin Học Sinh</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Họ và tên</p>
                <p className="text-gray-900">{request.studentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500">Mã học sinh</p>
                <p className="text-gray-900">{request.studentId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500">Môn học</p>
                <p className="text-gray-900">{request.subject}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500">Ngày gửi</p>
                <p className="text-gray-900">{new Date(request.submittedDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Grade Change Information */}
        <div className="space-y-4">
          <h3 className="text-gray-700">Thông Tin Điểm</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500">Loại điểm</p>
              <Badge 
                variant="outline" 
                className={gradeTypeColors[request.gradeType]}
              >
                {gradeTypeLabels[request.gradeType]}
              </Badge>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Điểm cũ</p>
                <div className="text-red-600 px-6 py-3 bg-white rounded-lg shadow-sm border border-red-200">
                  {request.oldGrade}
                </div>
              </div>

              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-2">Điểm đề nghị sửa</p>
                <div className="text-green-600 px-6 py-3 bg-white rounded-lg shadow-sm border border-green-200">
                  {request.newGrade}
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-700"
              >
                Tăng {(request.newGrade - request.oldGrade).toFixed(1)} điểm
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Teacher and Reason */}
        <div className="space-y-4">
          <h3 className="text-gray-700">Thông Tin Giáo Viên & Lý Do</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 mb-1">Giáo viên yêu cầu</p>
              <p className="text-gray-900">{request.teacherName}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Lý do sửa điểm</p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-900 leading-relaxed">{request.reason}</p>
              </div>
            </div>

            {request.evidence && (
              <div>
                <p className="text-gray-500 mb-1">Minh chứng</p>
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <Paperclip className="h-4 w-4" />
                  <span>{request.evidence}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="mt-4">
          {request.status === 'Chờ duyệt' ? (
            <div className="rounded-lg p-4 border border-orange-200 bg-orange-50 text-orange-800">
              <strong>Trạng thái: Chờ duyệt</strong>
            </div>
          ) : request.status === 'Đã duyệt' ? (
            <div className="rounded-lg p-4 border border-green-200 bg-green-50 text-green-800">
              <strong>Trạng thái: Đã duyệt</strong>
            </div>
          ) : (
            <div className="rounded-lg p-4 border border-red-200 bg-red-50 text-red-800">
              <strong>Trạng thái: Từ chối</strong>
            </div>
          )}

          {/* Footer actions: always visible but disabled when not pending */}
          <div className="mt-4 flex gap-3 justify-end">
            <Button
              onClick={() => onApprove(request.id)}
              disabled={!isPending || isProcessing}
              className={`px-4 py-2 ${isPending ? 'bg-green-600 hover:bg-green-700' : 'bg-green-200 text-green-700 cursor-not-allowed'}`}
            >
              <CheckCircle className="h-4 w-4 mr-2 inline-block" />
              {isProcessing ? 'Đang xử lý...' : 'Duyệt'}
            </Button>

            <Button
              onClick={() => onReject(request.id)}
              disabled={!isPending || isProcessing}
              variant="destructive"
              className={`${isPending ? '' : 'opacity-60 cursor-not-allowed'}`}
            >
              <XCircle className="h-4 w-4 mr-2 inline-block" />
              {isProcessing ? 'Đang xử lý...' : 'Không duyệt'}
            </Button>
          </div>
        </div>

        {/* Note */}
        {isPending && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-800">
              <strong>Lưu ý:</strong> Sau khi duyệt phiếu, hệ thống sẽ tự động gửi thông báo đến giáo viên 
              và cho phép cập nhật điểm trong sổ điểm học sinh.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
