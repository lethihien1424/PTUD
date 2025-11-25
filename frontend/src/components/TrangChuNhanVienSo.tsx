import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, TrendingUp, Users, CheckCircle, Building2, FileEdit, UserPlus, Target, Home } from 'lucide-react';

interface EducationDeptDashboardProps {
  user: User;
  onLogout: () => void;
}

const schools = [
  { id: 1, name: 'THPT Nguyễn Huệ', quota10: 400, enrolled10: 398, quota6: 300, enrolled6: 295 },
  { id: 2, name: 'THPT Lê Lợi', quota10: 350, enrolled10: 345, quota6: 280, enrolled6: 275 },
  { id: 3, name: 'THPT Trần Hưng Đạo', quota10: 420, enrolled10: 415, quota6: 320, enrolled6: 318 },
];

const examResults = [
  { id: 1, studentId: 'HS001', name: 'Nguyễn Văn A', math: 8.5, literature: 8.0, english: 9.0, total: 25.5, status: 'pending' },
  { id: 2, studentId: 'HS002', name: 'Trần Thị B', math: 7.5, literature: 8.5, english: 8.0, total: 24.0, status: 'pending' },
  { id: 3, studentId: 'HS003', name: 'Lê Văn C', math: 9.0, literature: 8.5, english: 8.5, total: 26.0, status: 'entered' },
];

const examCandidates = [
  { id: 1, sbd: 'TS001', name: 'Nguyễn Văn A', math: 0, literature: 0, english: 0, physics: 0, chemistry: 0, total: 0 },
  { id: 2, sbd: 'TS002', name: 'Trần Thị B', math: 0, literature: 0, english: 0, physics: 0, chemistry: 0, total: 0 },
  { id: 3, sbd: 'TS003', name: 'Lê Văn C', math: 0, literature: 0, english: 0, physics: 0, chemistry: 0, total: 0 },
];

const admissionCandidates = [
  { id: 1, sbd: 'TS001', name: 'Nguyễn Văn A', total: 27.5, priority1: 'THPT Nguyễn Huệ', status: 'pending' },
  { id: 2, sbd: 'TS002', name: 'Trần Thị B', total: 28.0, priority1: 'THPT Lê Lợi', status: 'pending' },
  { id: 3, sbd: 'TS003', name: 'Lê Văn C', total: 26.5, priority1: 'THPT Nguyễn Huệ', status: 'pending' },
  { id: 4, sbd: 'TS004', name: 'Phạm Thị D', total: 25.0, priority1: 'THPT Trần Hưng Đạo', status: 'pending' },
];

const quotaData = [
  { id: 1, school: 'THPT Nguyễn Huệ', grade: 'Lớp 10', quota: 400, registered: 520, admitted: 0 },
  { id: 2, school: 'THPT Lê Lợi', grade: 'Lớp 10', quota: 350, registered: 450, admitted: 0 },
  { id: 3, school: 'THPT Trần Hưng Đạo', grade: 'Lớp 10', quota: 300, registered: 380, admitted: 0 },
];

export default function EducationDeptDashboard({ user, onLogout }: EducationDeptDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [results, setResults] = useState(examResults);

  const handleApprove = (id: number) => {
    setResults(results.map(r => r.id === id ? { ...r, status: 'entered' } : r));
  };

  const stats = [
    { title: 'Tổng số trường', value: schools.length.toString(), icon: Building2, color: 'from-blue-500 to-blue-600' },
    { title: 'Tổng chỉ tiêu lớp 10', value: schools.reduce((sum, s) => sum + s.quota10, 0).toString(), icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { title: 'Đã tuyển lớp 10', value: schools.reduce((sum, s) => sum + s.enrolled10, 0).toString(), icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
    { title: 'Kết quả chờ duyệt', value: results.filter(r => r.status === 'pending').length.toString(), icon: FileText, color: 'from-amber-500 to-amber-600' },
  ];

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('overview')}
      >
        <Home size={18} className="mr-2" />
        Tổng quan
      </Button>
      <Button
        variant={activeTab === 'exam-scores' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('exam-scores')}
      >
        <FileEdit size={18} className="mr-2" />
        Nhập điểm thi
      </Button>
      <Button
        variant={activeTab === 'admission' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('admission')}
      >
        <UserPlus size={18} className="mr-2" />
        Xét tuyển
      </Button>
      <Button
        variant={activeTab === 'quota' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('quota')}
      >
        <Target size={18} className="mr-2" />
        Nhập chỉ tiêu tuyển sinh
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-gray-900 mb-2">Bảng điều khiển Sở Giáo dục</h1>
            <p className="text-gray-600">Quản lý tuyển sinh toàn tỉnh</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-2xl shadow-lg`}>
                      <stat.icon size={28} strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="text-blue-600" size={20} />
                </div>
                <h2 className="text-gray-900">Tình hình tuyển sinh các trường</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="font-semibold text-gray-900">Tên trường</TableHead>
                    <TableHead className="font-semibold text-gray-900">Chỉ tiêu lớp 10</TableHead>
                    <TableHead className="font-semibold text-gray-900">Đã tuyển lớp 10</TableHead>
                    <TableHead className="font-semibold text-gray-900">Chỉ tiêu lớp 6</TableHead>
                    <TableHead className="font-semibold text-gray-900">Đã tuyển lớp 6</TableHead>
                    <TableHead className="font-semibold text-gray-900">Tỷ lệ hoàn thành</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => {
                    const rate = Math.round((school.enrolled10 / school.quota10) * 100);
                    return (
                      <TableRow key={school.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <TableCell className="font-medium text-gray-900">{school.name}</TableCell>
                        <TableCell className="text-gray-700">{school.quota10}</TableCell>
                        <TableCell><Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">{school.enrolled10}</Badge></TableCell>
                        <TableCell className="text-gray-700">{school.quota6}</TableCell>
                        <TableCell><Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">{school.enrolled6}</Badge></TableCell>
                        <TableCell>
                          <Badge className={rate >= 95 ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-sm' : 'bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm'}>
                            {rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <FileText className="text-amber-600" size={20} />
                </div>
                <h2 className="text-gray-900">Kết quả thi cần duyệt</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="font-semibold text-gray-900">Mã HS</TableHead>
                    <TableHead className="font-semibold text-gray-900">Họ và tên</TableHead>
                    <TableHead className="font-semibold text-gray-900">Toán</TableHead>
                    <TableHead className="font-semibold text-gray-900">Văn</TableHead>
                    <TableHead className="font-semibold text-gray-900">Anh</TableHead>
                    <TableHead className="font-semibold text-gray-900">Tổng điểm</TableHead>
                    <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell className="text-gray-700">{result.studentId}</TableCell>
                      <TableCell className="font-medium text-gray-900">{result.name}</TableCell>
                      <TableCell className="text-gray-700">{result.math}</TableCell>
                      <TableCell className="text-gray-700">{result.literature}</TableCell>
                      <TableCell className="text-gray-700">{result.english}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm font-semibold">{result.total}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={result.status === 'entered' ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-sm' : 'bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm'}>
                          {result.status === 'entered' ? 'Đã nhập' : 'Chờ duyệt'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(result.id)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm"
                          >
                            Duyệt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-gray-900 mb-4">Thống kê tuyển sinh</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-gray-600 mb-1">Tổng chỉ tiêu</p>
                  <p className="text-gray-900">1,170 học sinh</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-gray-600 mb-1">Đã tuyển</p>
                  <p className="text-gray-900">1,158 học sinh</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-gray-600 mb-1">Tỷ lệ hoàn thành</p>
                  <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm mt-2">98.9%</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-gray-900 mb-4">Hoạt động gần đây</h3>
              <div className="space-y-3">
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                  <p className="font-medium text-gray-900">THPT Nguyễn Huệ hoàn thành tuyển sinh</p>
                  <p className="text-gray-600">Đạt 99.5% chỉ tiêu</p>
                  <p className="text-gray-500 text-sm">Hôm nay, 10:30</p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <p className="font-medium text-gray-900">Duyệt 15 kết quả thi tuyển</p>
                  <p className="text-gray-600">THPT Trần Hưng Đạo</p>
                  <p className="text-gray-500 text-sm">Hôm nay, 09:15</p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded">
                  <p className="font-medium text-gray-900">Cập nhật chỉ tiêu tuyển sinh</p>
                  <p className="text-gray-600">THPT Lê Lợi</p>
                  <p className="text-gray-500 text-sm">Hôm qua, 16:45</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'exam-scores' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Nhập điểm thi</h2>
              <p className="text-gray-600">Nhập điểm thi tuyển sinh lớp 10</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <FileEdit size={18} className="mr-2" />
              Nhập từ Excel
            </Button>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kỳ thi</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Tuyển sinh lớp 10 năm 2024</option>
                    <option>Tuyển sinh lớp 10 năm 2023</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tìm theo SBD</Label>
                  <Input placeholder="Nhập số báo danh..." />
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">SBD</TableHead>
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Toán</TableHead>
                  <TableHead className="font-semibold text-gray-900">Văn</TableHead>
                  <TableHead className="font-semibold text-gray-900">Anh</TableHead>
                  <TableHead className="font-semibold text-gray-900">Lý</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hóa</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{candidate.sbd}</TableCell>
                    <TableCell className="text-gray-700">{candidate.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.25" 
                        min="0" 
                        max="10" 
                        placeholder="0" 
                        className="w-16" 
                        defaultValue={candidate.math || ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.25" 
                        min="0" 
                        max="10" 
                        placeholder="0" 
                        className="w-16"
                        defaultValue={candidate.literature || ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.25" 
                        min="0" 
                        max="10" 
                        placeholder="0" 
                        className="w-16"
                        defaultValue={candidate.english || ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.25" 
                        min="0" 
                        max="10" 
                        placeholder="0" 
                        className="w-16"
                        defaultValue={candidate.physics || ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.25" 
                        min="0" 
                        max="10" 
                        placeholder="0" 
                        className="w-16"
                        defaultValue={candidate.chemistry || ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {candidate.total || 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300">
                  Lưu điểm
                </Button>
                <Button variant="outline" className="hover:bg-gray-50">
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'admission' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Xét tuyển</h2>
              <p className="text-gray-600">Xét tuyển học sinh vào lớp 10</p>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300">
              <UserPlus size={18} className="mr-2" />
              Chạy xét tuyển
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Tổng thí sinh</p>
                <p className="text-gray-900">1,350</p>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Đã trúng tuyển</p>
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm text-lg px-4 py-1">
                  1,043
                </Badge>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Đang chờ</p>
                <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm text-lg px-4 py-1">
                  307
                </Badge>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Điểm chuẩn TB</p>
                <p className="text-gray-900">25.5</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 border-0 shadow-md">
            <div className="space-y-4">
              <h3 className="text-gray-900">Bộ lọc xét tuyển</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trường</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Tất cả</option>
                    <option>THPT Nguyễn Huệ</option>
                    <option>THPT Lê Lợi</option>
                    <option>THPT Trần Hưng Đạo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Điểm tối thiểu</Label>
                  <Input type="number" step="0.25" placeholder="20.0" />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Tất cả</option>
                    <option>Đã trúng tuyển</option>
                    <option>Đang chờ</option>
                    <option>Không đạt</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">SBD</TableHead>
                  <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tổng điểm</TableHead>
                  <TableHead className="font-semibold text-gray-900">Nguyện vọng 1</TableHead>
                  <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissionCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{candidate.sbd}</TableCell>
                    <TableCell className="text-gray-700">{candidate.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {candidate.total}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{candidate.priority1}</TableCell>
                    <TableCell>
                      <Badge className={candidate.status === 'admitted' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-sm' 
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm'
                      }>
                        {candidate.status === 'admitted' ? 'Trúng tuyển' : 'Chờ xét'}
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
      )}

      {activeTab === 'quota' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 mb-2">Nhập chỉ tiêu tuyển sinh</h2>
              <p className="text-gray-600">Cập nhật chỉ tiêu tuyển sinh các trường</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
              <Target size={18} className="mr-2" />
              Thêm trường
            </Button>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Trường</TableHead>
                  <TableHead className="font-semibold text-gray-900">Cấp độ</TableHead>
                  <TableHead className="font-semibold text-gray-900">Chỉ tiêu</TableHead>
                  <TableHead className="font-semibold text-gray-900">Đã đăng ký</TableHead>
                  <TableHead className="font-semibold text-gray-900">Đã tuyển</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotaData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.school}</TableCell>
                    <TableCell className="text-gray-700">{item.grade}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={item.quota} 
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                        {item.registered}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                        {item.admitted}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
                        >
                          Lưu
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200"
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-gray-900 mb-4">Tổng quan chỉ tiêu</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-gray-600 mb-1">Tổng chỉ tiêu</p>
                <p className="text-gray-900">1,050 học sinh</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <p className="text-gray-600 mb-1">Tổng đăng ký</p>
                <p className="text-gray-900">1,350 học sinh</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <p className="text-gray-600 mb-1">Tỷ lệ đăng ký</p>
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm mt-2">128.6%</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
