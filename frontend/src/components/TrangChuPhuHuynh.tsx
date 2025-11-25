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
import { BookOpen, UserCircle, FileText, DollarSign, School, CheckCircle } from 'lucide-react';

interface TrangChuPhuHuynhProps {
  user: User;
  onLogout: () => void;
}

const grades = [
  { id: 1, subject: 'Toán', midterm: 8.5, final: 0, avg: 8.5 },
  { id: 2, subject: 'Văn', midterm: 8.0, final: 0, avg: 8.0 },
  { id: 3, subject: 'Anh', midterm: 9.0, final: 0, avg: 9.0 },
  { id: 4, subject: 'Lý', midterm: 7.5, final: 0, avg: 7.5 },
  { id: 5, subject: 'Hóa', midterm: 8.0, final: 0, avg: 8.0 },
];

const feeHistory = [
  { id: 1, month: 'Tháng 11/2024', amount: '500,000đ', status: 'paid', date: '05/11/2024' },
  { id: 2, month: 'Tháng 10/2024', amount: '500,000đ', status: 'paid', date: '05/10/2024' },
  { id: 3, month: 'Tháng 9/2024', amount: '500,000đ', status: 'paid', date: '05/09/2024' },
  { id: 4, month: 'Tháng 12/2024', amount: '500,000đ', status: 'pending', date: '-' },
];

export default function TrangChuPhuHuynh({ user, onLogout }: TrangChuPhuHuynhProps) {
  const [activeTab, setActiveTab] = useState('grades');

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'grades' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('grades')}
      >
        <BookOpen size={18} className="mr-2" />
        Xem kết quả học tập
      </Button>
      <Button
        variant={activeTab === 'student-info' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('student-info')}
      >
        <UserCircle size={18} className="mr-2" />
        Quản lý thông tin học sinh
      </Button>
      <Button
        variant={activeTab === 'absence' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('absence')}
      >
        <FileText size={18} className="mr-2" />
        Gửi đơn vắng học
      </Button>
      <Button
        variant={activeTab === 'payment' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('payment')}
      >
        <DollarSign size={18} className="mr-2" />
        Thanh toán học phí
      </Button>
      <Button
        variant={activeTab === 'registration' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('registration')}
      >
        <School size={18} className="mr-2" />
        Đăng ký nguyện vọng
      </Button>
      <Button
        variant={activeTab === 'enrollment' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('enrollment')}
      >
        <CheckCircle size={18} className="mr-2" />
        Xác nhận nhập học
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Kết quả học tập của con</h2>
            <p className="text-gray-600">Học sinh: Nguyễn Văn A - Lớp 10A1</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Điểm trung bình</p>
                <p className="text-gray-900">8.2</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Xếp loại</p>
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm text-lg px-4 py-1">
                  Giỏi
                </Badge>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Hạnh kiểm</p>
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm text-lg px-4 py-1">
                  Tốt
                </Badge>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Môn học</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm giữa kỳ</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm cuối kỳ</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm TB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{grade.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {grade.midterm}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {grade.final || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {grade.avg}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'student-info' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Quản lý thông tin học sinh</h2>
            <p className="text-gray-600">Cập nhật thông tin cá nhân của con</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input defaultValue="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input type="date" defaultValue="2008-05-15" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lớp</Label>
                  <Input defaultValue="10A1" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Input defaultValue="Nam" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Textarea defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số điện thoại phụ huynh</Label>
                  <Input defaultValue="0912345678" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="parent@email.com" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Cập nhật thông tin
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'absence' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Gửi đơn xin phép vắng học</h2>
            <p className="text-gray-600">Thông báo khi con nghỉ học có lý do</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Từ ngày</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Đến ngày</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lý do</Label>
                <Textarea placeholder="Nhập lý do xin phép nghỉ học..." className="min-h-[120px]" />
              </div>

              <div className="space-y-2">
                <Label>Tải lên giấy xác nhận (nếu có)</Label>
                <Input type="file" />
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Gửi đơn
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Thanh toán học phí</h2>
            <p className="text-gray-600">Quản lý và thanh toán học phí</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Tổng học phí</p>
                <p className="text-gray-900">2,000,000đ</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Đã đóng</p>
                <p className="text-green-600">1,500,000đ</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Còn nợ</p>
                <p className="text-red-600">500,000đ</p>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Kỳ học</TableHead>
                  <TableHead className="font-semibold text-gray-900">Số tiền</TableHead>
                  <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ngày đóng</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeHistory.map((fee) => (
                  <TableRow key={fee.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{fee.month}</TableCell>
                    <TableCell className="text-gray-700">{fee.amount}</TableCell>
                    <TableCell>
                      {fee.status === 'paid' ? (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                          Đã đóng
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm">
                          Chưa đóng
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">{fee.date}</TableCell>
                    <TableCell>
                      {fee.status === 'pending' && (
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Thanh toán
                        </Button>
                      )}
                      {fee.status === 'paid' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                        >
                          Xem biên lai
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'registration' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Đăng ký nguyện vọng</h2>
            <p className="text-gray-600">Đăng ký nguyện vọng vào lớp 10</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nguyện vọng 1</Label>
                <Input placeholder="THPT Nguyễn Huệ" />
              </div>

              <div className="space-y-2">
                <Label>Nguyện vọng 2</Label>
                <Input placeholder="THPT Lê Lợi" />
              </div>

              <div className="space-y-2">
                <Label>Nguyện vọng 3</Label>
                <Input placeholder="THPT Trần Hưng Đạo" />
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea placeholder="Thông tin bổ sung..." />
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Đăng ký
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Xác nhận nhập học</h2>
            <p className="text-gray-600">Xác nhận nhập học năm học 2024-2025</p>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={24} />
                  Kết quả trúng tuyển
                </h3>
                <div className="space-y-2 mt-4">
                  <p className="text-gray-700">Học sinh: <span className="font-semibold">Nguyễn Văn A</span></p>
                  <p className="text-gray-700">Trường: <span className="font-semibold">THPT Nguyễn Huệ</span></p>
                  <p className="text-gray-700">Lớp: <span className="font-semibold">10A1</span></p>
                  <p className="text-gray-700">Điểm trúng tuyển: <span className="font-semibold">25.5</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-gray-900">Thông tin xác nhận</h3>
                <div className="space-y-2">
                  <Label>Số điện thoại liên hệ</Label>
                  <Input defaultValue="0912345678" />
                </div>

                <div className="space-y-2">
                  <Label>Email liên hệ</Label>
                  <Input defaultValue="parent@email.com" />
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" id="confirm" className="w-4 h-4" />
                  <label htmlFor="confirm" className="text-gray-700 cursor-pointer">
                    Tôi xác nhận thông tin trên là chính xác và đồng ý cho con nhập học
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Xác nhận nhập học
                </Button>
                <Button variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
