import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Users, UserCheck, ClipboardList, BookOpen } from 'lucide-react';

interface TrangChuGiaoVuProps {
  user: User;
  onLogout: () => void;
}

const scheduleData = [
  { id: 1, class: '10A1', monday: 'Toán - GV A', tuesday: 'Văn - GV B', wednesday: 'Anh - GV C', thursday: 'Lý - GV D', friday: 'Hóa - GV E' },
  { id: 2, class: '10A2', monday: 'Văn - GV B', tuesday: 'Toán - GV A', wednesday: 'Lý - GV D', thursday: 'Anh - GV C', friday: 'Sinh - GV F' },
  { id: 3, class: '10A3', monday: 'Anh - GV C', tuesday: 'Lý - GV D', wednesday: 'Toán - GV A', thursday: 'Văn - GV B', friday: 'Sử - GV G' },
];

const classes = [
  { id: 1, name: '10A1', teacher: 'Nguyễn Văn A', students: 35, room: 'Phòng 101' },
  { id: 2, name: '10A2', teacher: 'Lê Thị B', students: 33, room: 'Phòng 102' },
  { id: 3, name: '10A3', teacher: 'Trần Văn C', students: 34, room: 'Phòng 103' },
  { id: 4, name: '10A4', teacher: 'Phạm Thị D', students: 36, room: 'Phòng 104' },
];

const teachers = [
  { id: 1, name: 'Nguyễn Văn A', subject: 'Toán', email: 'nguyenvana@school.edu.vn', phone: '0912345678' },
  { id: 2, name: 'Lê Thị B', subject: 'Văn', email: 'lethib@school.edu.vn', phone: '0912345679' },
  { id: 3, name: 'Trần Văn C', subject: 'Anh', email: 'tranvanc@school.edu.vn', phone: '0912345680' },
  { id: 4, name: 'Phạm Thị D', subject: 'Lý', email: 'phamthid@school.edu.vn', phone: '0912345681' },
];

const attendanceData = [
  { id: 1, class: '10A1', date: '25/11/2024', present: 32, absent: 3, late: 0 },
  { id: 2, class: '10A2', date: '25/11/2024', present: 30, absent: 2, late: 1 },
  { id: 3, class: '10A3', date: '25/11/2024', present: 34, absent: 0, late: 0 },
  { id: 4, class: '10A4', date: '25/11/2024', present: 33, absent: 2, late: 1 },
];

export default function TrangChuGiaoVu({ user, onLogout }: TrangChuGiaoVuProps) {
  const [activeTab, setActiveTab] = useState('schedule');

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'schedule' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('schedule')}
      >
        <Calendar size={18} className="mr-2" />
        Lập thời khóa biểu
      </Button>
      <Button
        variant={activeTab === 'attendance' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('attendance')}
      >
        <ClipboardList size={18} className="mr-2" />
        Điểm danh học sinh
      </Button>
      <Button
        variant={activeTab === 'classes' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('classes')}
      >
        <BookOpen size={18} className="mr-2" />
        Quản lý lớp
      </Button>
      <Button
        variant={activeTab === 'teachers' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('teachers')}
      >
        <UserCheck size={18} className="mr-2" />
        Quản lý thông tin giáo viên
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Lập thời khóa biểu</h2>
              <p className="text-gray-600">Quản lý thời khóa biểu các lớp học</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <Calendar size={18} className="mr-2" />
              Tạo TKB mới
            </Button>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 2</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 3</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 4</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 5</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 6</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.class}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{item.monday}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{item.tuesday}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{item.wednesday}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{item.thursday}</TableCell>
                    <TableCell className="text-gray-700 text-sm">{item.friday}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                      >
                        Chỉnh sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Điểm danh học sinh</h2>
              <p className="text-gray-600">Theo dõi tình hình điểm danh hôm nay</p>
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-48" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Có mặt</p>
                  <p className="text-gray-900">129 học sinh</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Vắng</p>
                  <p className="text-gray-900">7 học sinh</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-3 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Đi muộn</p>
                  <p className="text-gray-900">2 học sinh</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ngày</TableHead>
                  <TableHead className="font-semibold text-gray-900">Có mặt</TableHead>
                  <TableHead className="font-semibold text-gray-900">Vắng</TableHead>
                  <TableHead className="font-semibold text-gray-900">Đi muộn</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.class}</TableCell>
                    <TableCell className="text-gray-700">{item.date}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                        {item.present}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm">
                        {item.absent}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm">
                        {item.late}
                      </Badge>
                    </TableCell>
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
      )} */}

      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Quản lý lớp</h2>
              <p className="text-gray-600">Danh sách các lớp học</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <BookOpen size={18} className="mr-2" />
              Thêm lớp mới
            </Button>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Tên lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">GVCN</TableHead>
                  <TableHead className="font-semibold text-gray-900">Sĩ số</TableHead>
                  <TableHead className="font-semibold text-gray-900">Phòng học</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-gray-700">{item.teacher}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {item.students}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.room}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                        >
                          Xem
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-200"
                        >
                          Sửa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Quản lý thông tin giáo viên</h2>
              <p className="text-gray-600">Danh sách giáo viên</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <UserCheck size={18} className="mr-2" />
              Thêm giáo viên
            </Button>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Môn dạy</TableHead>
                  <TableHead className="font-semibold text-gray-900">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điện thoại</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{teacher.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0">
                        {teacher.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{teacher.email}</TableCell>
                    <TableCell className="text-gray-700">{teacher.phone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                        >
                          Xem
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-200"
                        >
                          Sửa
                        </Button>
                      </div>
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