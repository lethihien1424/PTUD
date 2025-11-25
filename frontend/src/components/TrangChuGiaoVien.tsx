import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ClipboardList, Send, FileEdit, Users } from 'lucide-react';

interface TrangChuGiaoVienProps {
  user: User;
  onLogout: () => void;
}

const students = [
  { id: 1, name: 'Nguyễn Văn A', class: '10A1', math: 8.5, status: 'Tốt' },
  { id: 2, name: 'Trần Thị B', class: '10A1', math: 8.0, status: 'Tốt' },
  { id: 3, name: 'Lê Văn C', class: '10A1', math: 7.2, status: 'Khá' },
  { id: 4, name: 'Phạm Thị D', class: '10A2', math: 8.8, status: 'Tốt' },
  { id: 5, name: 'Hoàng Văn E', class: '10A2', math: 6.5, status: 'Trung bình' },
];

const homeworkList = [
  { id: 1, class: '10A1', title: 'Bài tập chương 3', deadline: '27/11/2024', submitted: 30, total: 35 },
  { id: 2, class: '10A2', title: 'Kiểm tra 15 phút', deadline: '28/11/2024', submitted: 28, total: 33 },
  { id: 3, class: '10A3', title: 'Bài tập về nhà', deadline: '29/11/2024', submitted: 32, total: 34 },
];

const correctionRequests = [
  { id: 1, student: 'Trần Thị B', oldGrade: 7, newGrade: 8, reason: 'Chấm nhầm bài kiểm tra', status: 'pending' },
  { id: 2, student: 'Lê Văn C', oldGrade: 6.5, newGrade: 7, reason: 'Bổ sung điểm bài tập', status: 'approved' },
];

export default function TrangChuGiaoVien({ user, onLogout }: TrangChuGiaoVienProps) {
  const [activeTab, setActiveTab] = useState('classes');

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'classes' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('classes')}
      >
        <Users size={18} className="mr-2" />
        Xem danh sách lớp
      </Button>
      <Button
        variant={activeTab === 'homework' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('homework')}
      >
        <ClipboardList size={18} className="mr-2" />
        Giao bài tập
      </Button>
      <Button
        variant={activeTab === 'grades' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('grades')}
      >
        <FileEdit size={18} className="mr-2" />
        Nhập điểm môn học
      </Button>
      <Button
        variant={activeTab === 'corrections' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('corrections')}
      >
        <Send size={18} className="mr-2" />
        Gửi yêu cầu sửa điểm
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Danh sách lớp</h2>
            <p className="text-gray-600">Các lớp bạn đang giảng dạy môn Toán</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Lớp 10A1</h3>
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                  35 HS
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">GVCN: Nguyễn Văn A</p>
              <p className="text-gray-600 mb-4">Phòng: 101</p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
              >
                Xem chi tiết
              </Button>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Lớp 10A2</h3>
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                  33 HS
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">GVCN: Lê Thị B</p>
              <p className="text-gray-600 mb-4">Phòng: 102</p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
              >
                Xem chi tiết
              </Button>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Lớp 10A3</h3>
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                  34 HS
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">GVCN: Trần Văn C</p>
              <p className="text-gray-600 mb-4">Phòng: 103</p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
              >
                Xem chi tiết
              </Button>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm TB</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hạnh kiểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                    <TableCell className="text-gray-700">{student.class}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {student.math}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-0">
                        {student.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Giao bài tập</h2>
              <p className="text-gray-600">Quản lý bài tập cho học sinh</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <ClipboardList size={18} className="mr-2" />
              Tạo bài tập mới
            </Button>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-gray-900 mb-4">Tạo bài tập mới</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lớp</Label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option>10A1</option>
                  <option>10A2</option>
                  <option>10A3</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tiêu đề bài tập</Label>
                <Input placeholder="Nhập tiêu đề bài tập..." />
              </div>

              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Textarea placeholder="Nhập nội dung bài tập..." className="min-h-[120px]" />
              </div>

              <div className="space-y-2">
                <Label>Hạn nộp</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Tải lên file đính kèm</Label>
                <Input type="file" />
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Giao bài tập
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Danh sách bài tập đã giao</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tiêu đề</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hạn nộp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Đã nộp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeworkList.map((hw) => (
                  <TableRow key={hw.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{hw.class}</TableCell>
                    <TableCell className="text-gray-700">{hw.title}</TableCell>
                    <TableCell className="text-gray-700">{hw.deadline}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {hw.submitted}/{hw.total}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                      >
                        Xem bài nộp
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Nhập điểm môn học</h2>
            <p className="text-gray-600">Nhập và cập nhật điểm cho học sinh</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chọn lớp</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2">
                    <option>10A1</option>
                    <option>10A2</option>
                    <option>10A3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Loại điểm</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2">
                    <option>Kiểm tra 15 phút</option>
                    <option>Kiểm tra 1 tiết</option>
                    <option>Giữa kỳ</option>
                    <option>Cuối kỳ</option>
                  </select>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">STT</TableHead>
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 3).map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{idx + 1}</TableCell>
                    <TableCell className="text-gray-700">{student.name}</TableCell>
                    <TableCell>
                      <Input type="number" step="0.5" min="0" max="10" placeholder="Nhập điểm" className="w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex gap-2 mt-4">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                Lưu điểm
              </Button>
              <Button variant="outline">
                Hủy
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'corrections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Gửi yêu cầu sửa điểm</h2>
              <p className="text-gray-600">Tạo phiếu yêu cầu sửa điểm gửi BGH</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <Send size={18} className="mr-2" />
              Tạo yêu cầu mới
            </Button>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-gray-900 mb-4">Tạo yêu cầu sửa điểm</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Học sinh</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2">
                    <option>Nguyễn Văn A</option>
                    <option>Trần Thị B</option>
                    <option>Lê Văn C</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <Input defaultValue="Toán" disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Điểm cũ</Label>
                  <Input type="number" step="0.5" placeholder="Nhập điểm cũ" />
                </div>
                <div className="space-y-2">
                  <Label>Điểm mới</Label>
                  <Input type="number" step="0.5" placeholder="Nhập điểm mới" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lý do sửa điểm</Label>
                <Textarea placeholder="Nhập lý do sửa điểm..." className="min-h-[100px]" />
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Gửi yêu cầu
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Lịch sử yêu cầu sửa điểm</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Học sinh</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm cũ</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm mới</TableHead>
                  <TableHead className="font-semibold text-gray-900">Lý do</TableHead>
                  <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {correctionRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{req.student}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {req.oldGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                        {req.newGrade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-xs">{req.reason}</TableCell>
                    <TableCell>
                      {req.status === 'pending' ? (
                        <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm">
                          Đang chờ
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                          Đã duyệt
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
