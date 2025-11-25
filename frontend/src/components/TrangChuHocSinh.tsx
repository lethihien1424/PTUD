import { useState } from 'react';
import { User } from '../App';
import DashboardLayout from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Bell, FileText, BookOpen, Calendar } from 'lucide-react';

interface TrangChuHocSinhProps {
  user: User;
  onLogout: () => void;
}

const notifications = [
  { id: 1, title: 'Thông báo nghỉ học', content: 'Trường thông báo nghỉ học vào ngày 26/11/2024', date: '24/11/2024', type: 'important' },
  { id: 2, title: 'Lịch thi giữa kỳ', content: 'Lịch thi giữa kỳ môn Toán: 28/11/2024', date: '23/11/2024', type: 'exam' },
  { id: 3, title: 'Nộp bài tập', content: 'Hạn nộp bài tập môn Văn: 27/11/2024', date: '22/11/2024', type: 'homework' },
];

const homework = [
  { id: 1, subject: 'Toán', title: 'Bài tập chương 3', deadline: '27/11/2024', status: 'pending' },
  { id: 2, subject: 'Văn', title: 'Viết bài luận về mùa thu', deadline: '28/11/2024', status: 'pending' },
  { id: 3, subject: 'Anh', title: 'Unit 5 - Exercise', deadline: '26/11/2024', status: 'completed' },
];

const grades = [
  { id: 1, subject: 'Toán', midterm: 8.5, final: 0, avg: 8.5 },
  { id: 2, subject: 'Văn', midterm: 8.0, final: 0, avg: 8.0 },
  { id: 3, subject: 'Anh', midterm: 9.0, final: 0, avg: 9.0 },
  { id: 4, subject: 'Lý', midterm: 7.5, final: 0, avg: 7.5 },
  { id: 5, subject: 'Hóa', midterm: 8.0, final: 0, avg: 8.0 },
];

const schedule = [
  { period: 'Tiết 1', monday: 'Toán', tuesday: 'Văn', wednesday: 'Anh', thursday: 'Lý', friday: 'Hóa' },
  { period: 'Tiết 2', monday: 'Văn', tuesday: 'Toán', wednesday: 'Lý', thursday: 'Anh', friday: 'Sinh' },
  { period: 'Tiết 3', monday: 'Anh', tuesday: 'Lý', wednesday: 'Toán', thursday: 'Văn', friday: 'Sử' },
  { period: 'Tiết 4', monday: 'Lý', tuesday: 'Hóa', wednesday: 'Văn', thursday: 'Toán', friday: 'Địa' },
];

export default function TrangChuHocSinh({ user, onLogout }: TrangChuHocSinhProps) {
  const [activeTab, setActiveTab] = useState('notifications');

  const sidebar = (
    <nav className="space-y-2">
      <Button
        variant={activeTab === 'notifications' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('notifications')}
      >
        <Bell size={18} className="mr-2" />
        Xem thông báo
      </Button>
      <Button
        variant={activeTab === 'homework' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('homework')}
      >
        <FileText size={18} className="mr-2" />
        Làm bài tập
      </Button>
      <Button
        variant={activeTab === 'grades' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('grades')}
      >
        <BookOpen size={18} className="mr-2" />
        Xem kết quả học tập
      </Button>
      <Button
        variant={activeTab === 'schedule' ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('schedule')}
      >
        <Calendar size={18} className="mr-2" />
        Xem thời khóa biểu
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebar={sidebar}>
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Thông báo</h2>
            <p className="text-gray-600">Các thông báo mới nhất từ nhà trường</p>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card key={notif.id} className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{notif.title}</h3>
                      {notif.type === 'important' && (
                        <Badge className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm">
                          Quan trọng
                        </Badge>
                      )}
                      {notif.type === 'exam' && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                          Thi cử
                        </Badge>
                      )}
                      {notif.type === 'homework' && (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                          Bài tập
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{notif.content}</p>
                    <p className="text-gray-500 text-sm">{notif.date}</p>
                  </div>
                  <Bell size={24} className="text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Bài tập</h2>
            <p className="text-gray-600">Danh sách bài tập được giao</p>
          </div>

          <div className="grid gap-4">
            {homework.map((hw) => (
              <Card key={hw.id} className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{hw.subject}</h3>
                      {hw.status === 'completed' ? (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
                          Đã nộp
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 shadow-sm">
                          Chưa nộp
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-1">{hw.title}</p>
                    <p className="text-gray-500 text-sm">Hạn nộp: {hw.deadline}</p>
                  </div>
                  {hw.status === 'pending' && (
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
                      Làm bài
                    </Button>
                  )}
                </div>
                {hw.status === 'pending' && (
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Nhập bài làm của bạn..." 
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300">
                        Nộp bài
                      </Button>
                      <Button variant="outline">
                        Tải lên file
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Kết quả học tập</h2>
            <p className="text-gray-600">Điểm số các môn học</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-2">Thời khóa biểu</h2>
            <p className="text-gray-600">Lớp 10A1 - Tuần 12 (25/11/2024 - 29/11/2024)</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Tiết</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 2</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 3</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 4</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 5</TableHead>
                  <TableHead className="font-semibold text-gray-900">Thứ 6</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{item.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {item.monday}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {item.tuesday}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {item.wednesday}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {item.thursday}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                        {item.friday}
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
