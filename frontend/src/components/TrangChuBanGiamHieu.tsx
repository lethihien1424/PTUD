import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, FileText, UserCheck } from 'lucide-react';

interface TrangChuBanGiamHieuProps {
  user: User;
  onLogout: () => void;
}

const statsData = [
  { name: 'Tổng số học sinh', value: '1,245', icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { name: 'Giáo viên', value: '85', icon: UserCheck, color: 'bg-gradient-to-br from-green-500 to-green-600' },
  { name: 'Lớp học', value: '42', icon: TrendingUp, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { name: 'Phiếu chờ duyệt', value: '3', icon: FileText, color: 'bg-gradient-to-br from-amber-500 to-yellow-600' },
];

const gradeData = [
  { month: 'T1', diemTB: 7.5, soHS: 340 },
  { month: 'T2', diemTB: 7.6, soHS: 355 },
  { month: 'T3', diemTB: 7.8, soHS: 370 },
  { month: 'T4', diemTB: 7.7, soHS: 365 },
  { month: 'T5', diemTB: 8.0, soHS: 380 },
];

const gradeCorrections = [
  { id: 1, teacher: 'Nguyễn Văn A', subject: 'Toán', student: 'Trần Thị B', oldGrade: 7, newGrade: 8, reason: 'Chấm nhầm bài kiểm tra 15 phút', status: 'pending' },
  { id: 2, teacher: 'Lê Thị C', subject: 'Văn', student: 'Phạm Văn D', oldGrade: 6.5, newGrade: 7, reason: 'Bổ sung điểm bài tập', status: 'pending' },
  { id: 3, teacher: 'Hoàng Văn E', subject: 'Anh', student: 'Mai Thị F', oldGrade: 5, newGrade: 6, reason: 'Sai sót nhập liệu', status: 'pending' },
];

const teacherAssignments = [
  { id: 1, teacher: 'Nguyễn Văn A', subject: 'Toán', classes: '10A1, 10A2, 10A3', hours: 15 },
  { id: 2, teacher: 'Lê Thị B', subject: 'Văn', classes: '10A1, 10A4', hours: 10 },
  { id: 3, teacher: 'Trần Văn C', subject: 'Anh', classes: '10A2, 10A3, 10A4', hours: 15 },
  { id: 4, teacher: 'Phạm Thị D', subject: 'Lý', classes: '10A1, 10A2', hours: 12 },
];

export default function TrangChuBanGiamHieu({ user, onLogout }: TrangChuBanGiamHieuProps) {
  const [activeTab, setActiveTab] = useState('statistics');

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'statistics' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('statistics')}
      >
        <TrendingUp size={18} className="mr-2" />
        Xem thống kê
      </Button>
      <Button
        variant={activeTab === 'assignments' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('assignments')}
      >
        <UserCheck size={18} className="mr-2" />
        Phân công giáo viên
      </Button>
      <Button
        variant={activeTab === 'corrections' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('corrections')}
      >
        <FileText size={18} className="mr-2" />
        Duyệt phiếu sửa điểm
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Thống kê tổng quan</h2>
            <p className="text-gray-600">Cập nhật mới nhất: Hôm nay, {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name} className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">{stat.name}</p>
                      <p className="text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} text-white p-3 rounded-xl shadow-md`}>
                      <Icon size={24} strokeWidth={2} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Điểm trung bình theo tháng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis domain={[0, 10]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="diemTB" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Điểm TB" 
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                Số học sinh theo tháng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="soHS" 
                    fill="#10b981" 
                    name="Số học sinh"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Phân công giáo viên</h2>
              <p className="text-gray-600">Quản lý phân công giảng dạy của giáo viên</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <UserCheck size={18} className="mr-2" />
              Phân công mới
            </Button>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Giáo viên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Môn dạy</TableHead>
                  <TableHead className="font-semibold text-gray-900">Lớp</TableHead>
                  <TableHead className="font-semibold text-gray-900">Số tiết/tuần</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherAssignments.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.teacher}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-0">
                        {item.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.classes}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {item.hours}
                      </Badge>
                    </TableCell>
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

      {activeTab === 'corrections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Duyệt phiếu sửa điểm</h2>
              <p className="text-gray-600">Quản lý các yêu cầu sửa điểm từ giáo viên</p>
            </div>
            <Badge 
              variant="secondary" 
              className="px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-0"
            >
              {gradeCorrections.length} đang chờ
            </Badge>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Giáo viên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Môn học</TableHead>
                  <TableHead className="font-semibold text-gray-900">Học sinh</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm cũ</TableHead>
                  <TableHead className="font-semibold text-gray-900">Điểm mới</TableHead>
                  <TableHead className="font-semibold text-gray-900">Lý do</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeCorrections.map((correction) => (
                  <TableRow key={correction.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{correction.teacher}</TableCell>
                    <TableCell className="text-gray-700">{correction.subject}</TableCell>
                    <TableCell className="text-gray-700">{correction.student}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {correction.oldGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                        {correction.newGrade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-xs">{correction.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Duyệt
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200"
                        >
                          Từ chối
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
