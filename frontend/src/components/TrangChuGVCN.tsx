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
import { ClipboardList, Send, FileEdit, Users, Award, FileUser } from 'lucide-react';

interface TrangChuGVCNProps {
  user: User;
  onLogout: () => void;
}

const students = [
  { id: 1, name: 'Nguyễn Văn A', dob: '15/05/2008', gender: 'Nam', conduct: 'Tốt', math: 8.5, absences: 0 },
  { id: 2, name: 'Trần Thị B', dob: '20/06/2008', gender: 'Nữ', conduct: 'Tốt', math: 8.0, absences: 1 },
  { id: 3, name: 'Lê Văn C', dob: '10/03/2008', gender: 'Nam', conduct: 'Khá', math: 7.2, absences: 3 },
  { id: 4, name: 'Phạm Thị D', dob: '25/07/2008', gender: 'Nữ', conduct: 'Tốt', math: 8.8, absences: 0 },
  { id: 5, name: 'Hoàng Văn E', dob: '12/04/2008', gender: 'Nam', conduct: 'Trung bình', math: 6.5, absences: 5 },
];

const homeworkList = [
  { id: 1, title: 'Bài tập chương 3', deadline: '27/11/2024', submitted: 30, total: 35 },
  { id: 2, title: 'Kiểm tra 15 phút', deadline: '28/11/2024', submitted: 28, total: 35 },
];

const correctionRequests = [
  { id: 1, student: 'Trần Thị B', oldGrade: 7, newGrade: 8, reason: 'Chấm nhầm bài kiểm tra', status: 'pending' },
];

export default function TrangChuGVCN({ user, onLogout }: TrangChuGVCNProps) {
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
        variant={activeTab === 'profile' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('profile')}
      >
        <FileUser size={18} className="mr-2" />
        Xem sơ yếu lí lịch
      </Button>
      <Button
        variant={activeTab === 'conduct' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('conduct')}
      >
        <Award size={18} className="mr-2" />
        Đánh giá hạnh kiểm
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
            <h2 className="text-gray-900 mb-2">Danh sách lớp chủ nhiệm</h2>
            <p className="text-gray-600">Lớp 10A1 - Năm học 2024-2025</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Tổng số học sinh</p>
                <p className="text-gray-900">35</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Điểm TB lớp</p>
                <p className="text-gray-900">7.8</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Hạnh kiểm tốt</p>
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm text-lg px-4 py-1">
                  28
                </Badge>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Vắng nhiều</p>
                <Badge className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm text-lg px-4 py-1">
                  2
                </Badge>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">STT</TableHead>
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Giới tính</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm TB</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hạnh kiểm</TableHead>
                  <TableHead className="font-semibold text-gray-900">Số buổi vắng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                    <TableCell className="text-gray-700">{student.gender}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {student.math}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`border-0 ${
                          student.conduct === 'Tốt' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                            : student.conduct === 'Khá'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                            : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800'
                        }`}
                      >
                        {student.conduct}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`shadow-sm ${
                          student.absences === 0
                            ? 'bg-gradient-to-r from-green-600 to-green-700'
                            : student.absences < 3
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
                            : 'bg-gradient-to-r from-red-600 to-red-700'
                        }`}
                      >
                        {student.absences}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Sơ yếu lí lịch học sinh</h2>
            <p className="text-gray-600">Thông tin chi tiết học sinh lớp 10A1</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ngày sinh</TableHead>
                  <TableHead className="font-semibold text-gray-900">Giới tính</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                    <TableCell className="text-gray-700">{student.dob}</TableCell>
                    <TableCell className="text-gray-700">{student.gender}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'conduct' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Đánh giá hạnh kiểm</h2>
            <p className="text-gray-600">Đánh giá hạnh kiểm học kỳ I năm học 2024-2025</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn học sinh</Label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  {students.map((student) => (
                    <option key={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Xếp loại hạnh kiểm</Label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option>Tốt</option>
                  <option>Khá</option>
                  <option>Trung bình</option>
                  <option>Yếu</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Nhận xét</Label>
                <Textarea 
                  placeholder="Nhập nhận xét về học sinh..." 
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Lưu đánh giá
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Thống kê hạnh kiểm lớp</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 pt-0">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="text-center">
                  <p className="text-green-800 mb-1">Tốt</p>
                  <p className="text-green-900">28 HS</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="text-center">
                  <p className="text-blue-800 mb-1">Khá</p>
                  <p className="text-blue-900">5 HS</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <div className="text-center">
                  <p className="text-amber-800 mb-1">Trung bình</p>
                  <p className="text-amber-900">2 HS</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                <div className="text-center">
                  <p className="text-red-800 mb-1">Yếu</p>
                  <p className="text-red-900">0 HS</p>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Giao bài tập</h2>
              <p className="text-gray-600">Quản lý bài tập cho lớp 10A1</p>
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
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Tiêu đề</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hạn nộp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Đã nộp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeworkList.map((hw) => (
                  <TableRow key={hw.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{hw.title}</TableCell>
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
            <p className="text-gray-600">Nhập điểm cho học sinh lớp 10A1</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4 mb-6">
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
                    {students.map((student) => (
                      <option key={student.id}>{student.name}</option>
                    ))}
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
                    <TableCell className="text-gray-700">{req.reason}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm">
                        Đang chờ
                      </Badge>
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
