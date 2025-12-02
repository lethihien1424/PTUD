import { useState, useEffect } from "react";
import { Calendar, Users, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface User {
  maTaiKhoan: string;
  tenDangNhap: string;
  loaiTaiKhoan: string;
  details: {
    maGV: string;
    hoTen: string;
    lopChuNhiem: string;
  };
}

interface AttendanceRecord {
  maDiemDanh: string;
  maHocSinh: string;
  hoTen: string;
  maLop: string;
  ngayDiemDanh: string;
  trangThai: string;
  ghiChu: string | null;
  lyDo?: string | null; 
}

interface ClassInfo {
  maLop: string;
  tenLop: string;
  khoi: string;
  siSo: number;
  soHocSinh: number;
}

interface AbsenceDetail {
  maHocSinh: string;
  dates: string[];
}

export default function DiemDanhGVCN({ user }: { user: User }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]); 
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'absenceReport'>('attendance'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [absenceReport, setAbsenceReport] = useState([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportType, setReportType] = useState<"month" | "year">("month");

  const [absenceDetails, setAbsenceDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const API_URL = "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  // Lấy thông tin lớp chủ nhiệm
  useEffect(() => {
    fetchClassInfo();
  }, []);

  // Lấy điểm danh khi đổi ngày
  useEffect(() => {
    if (classInfo && classInfo.maLop) {
      fetchAttendance();
    }
  }, [selectedDate, classInfo]);

  // Load danh sách học sinh khi chuyển tab
  useEffect(() => {
    if (activeTab === 'students' && classInfo && classInfo.maLop) {
      fetchStudentList();
    }
  }, [activeTab, classInfo]);

  // Load thống kê vắng học khi chuyển tab hoặc đổi tháng/năm
  useEffect(() => {
    if (activeTab === 'absenceReport' && classInfo && classInfo.maLop) {
      fetchAbsenceReport();
    }
  }, [activeTab, classInfo, reportMonth, reportYear, reportType]);

  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/attendance/teacher/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setClassInfo(data.data[0]);
      } else {
        setError("Không tìm thấy lớp chủ nhiệm");
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin lớp:", err);
      setError("Không thể tải thông tin lớp");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!classInfo || !classInfo.maLop) {
      setError("Chưa có thông tin lớp chủ nhiệm");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/attendance/class/${classInfo.maLop}/date/${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setAttendanceList(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Lỗi lấy điểm danh:", err);
      setError("Không thể tải dữ liệu điểm danh");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentList = async () => {
    if (!classInfo || !classInfo.maLop) {
      setError("Chưa có thông tin lớp chủ nhiệm");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/attendance/class/${classInfo.maLop}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setStudentList(data.data);
        setError(""); 
      } else {
        setError(data.message || "Không có dữ liệu học sinh");
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách học sinh:", err);
      setError("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsenceReport = async () => {
    if (!classInfo || !classInfo.maLop) {
      setReportError("Chưa có thông tin lớp chủ nhiệm");
      return;
    }
    setReportLoading(true);
    setReportError("");
    try {
      let url = "";
      if (reportType === "month") {
        url = `${API_URL}/attendance/class/${classInfo.maLop}/report?year=${reportYear}&month=${reportMonth}`;
      } else {
        url = `${API_URL}/attendance/class/${classInfo.maLop}/report/year/${reportYear}`;
      }
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setAbsenceReport(data.data);
      else setReportError(data.message || "Không có dữ liệu báo cáo");
    } catch (err) {
      setReportError("Không thể tải báo cáo");
    } finally {
      setReportLoading(false);
    }
  };

  // Hàm lấy chi tiết ngày vắng của một học sinh
  const fetchAbsenceDates = async (maHocSinh: string) => {
    if (absenceDetails[maHocSinh]) {
      // Đã tải rồi thì không tải lại
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [maHocSinh]: true }));
    
    try {
      const token = localStorage.getItem("token");
      let startDate = "";
      let endDate = "";
      
      if (reportType === "month") {
        startDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(reportYear, reportMonth, 0).getDate();
        endDate = `${reportYear}-${String(reportMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else {
        startDate = `${reportYear}-01-01`;
        endDate = `${reportYear}-12-31`;
      }

      // Sử dụng API mới cho thống kê chi tiết
      const url = `${API_URL}/attendance/statistics/detailed/${classInfo?.maLop}?startDate=${startDate}&endDate=${endDate}`;

      console.log('🔍 Đang gọi API:', url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      
      console.log('📊 Dữ liệu từ API:', data);
      
      if (data.success && data.data) {
        // Tìm học sinh trong kết quả
        const studentData = data.data.find((s: any) => s.maHocSinh === maHocSinh);
        
        console.log('👨‍🎓 Dữ liệu học sinh:', studentData);
        
        if (studentData) {
          const details = {
            coPhep: studentData.chiTietVangCoPhep || [],
            khongPhep: studentData.chiTietVangKhongPhep || [],
            vang: studentData.chiTietVang || []
          };
          
          console.log('✅ Chi tiết vắng:', details);
          
          setAbsenceDetails(prev => ({
            ...prev,
            [maHocSinh]: details
          }));
        } else {
          console.warn('⚠️ Không tìm thấy học sinh:', maHocSinh);
        }
      } else {
        console.error('❌ API trả về lỗi:', data.message);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết ngày vắng:", error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [maHocSinh]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "destructive" | "secondary" } } = {
      co_mat: { label: "Có mặt", variant: "default" }, 
      Vắng: { label: "Vắng", variant: "destructive" },
      muon: { label: "Muộn", variant: "secondary" }, 
      "Có phép": { label: "Có phép", variant: "secondary" },
      "Không phép": { label: "Không phép", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.variant === "default" && <CheckCircle className="h-3 w-3" />}
        {config.variant === "destructive" && <XCircle className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const getStatistics = () => {
    const total = classInfo?.siSo || classInfo?.soHocSinh || studentList.length;
    const absent = attendanceList.length;
    const present = total - absent;

    return { total, present, absent };
  };

  const handleExportReport = () => {
    if (!absenceReport || absenceReport.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Kiểm tra xem đã load chi tiết cho học sinh nào chưa
    const studentsWithDetails = absenceReport.filter(row => absenceDetails[row.maHocSinh]);
    
    if (studentsWithDetails.length === 0) {
      alert('⚠️ Vui lòng click "Xem chi tiết" cho ít nhất một học sinh trước khi xuất file!');
      return;
    }

    // Header với tiếng Việt rõ ràng
    const header = [
      "STT", 
      "Ma HS", 
      "Ho va ten", 
      "Tong so lan vang",
      "Vang co phep (so buoi)",
      "Ngay vang co phep",
      "Vang khong phep (so buoi)",
      "Ngay vang khong phep"
    ];

    const rows = absenceReport.map((row, idx) => {
      const details = absenceDetails[row.maHocSinh];
      
      // Lấy danh sách ngày vắng có phép
      let ngayCoPhep = '-';
      let soNgayCoPhep = 0;
      
      if (details && details.coPhep && details.coPhep.length > 0) {
        soNgayCoPhep = details.coPhep.length;
        ngayCoPhep = details.coPhep.map((item: any) => {
          const date = new Date(item.ngay);
          const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          const lyDo = item.lyDo ? ` (${item.lyDo})` : '';
          return `${dateStr}${lyDo}`;
        }).join('; ');
      }

      // Lấy danh sách ngày vắng không phép
      let ngayKhongPhep = '-';
      let soNgayKhongPhep = 0;
      
      if (details && details.khongPhep && details.khongPhep.length > 0) {
        soNgayKhongPhep = details.khongPhep.length;
        ngayKhongPhep = details.khongPhep.map((item: any) => {
          const date = new Date(item.ngay);
          const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          const lyDo = item.lyDo ? ` (${item.lyDo})` : '';
          return `${dateStr}${lyDo}`;
        }).join('; ');
      }

      return [
        idx + 1,
        row.maHocSinh,
        row.hoTen,
        row.soLanVang || 0,
        soNgayCoPhep,
        ngayCoPhep,
        soNgayKhongPhep,
        ngayKhongPhep
      ];
    });

    // Tạo CSV content với encoding UTF-8
    const csvContent = [header, ...rows]
      .map(row => row.map(cell => {
        // Escape dấu ngoặc kép trong cell
        const cellStr = String(cell).replace(/"/g, '""');
        return `"${cellStr}"`;
      }).join(","))
      .join("\r\n");

    // Thêm BOM (Byte Order Mark) để Excel nhận diện UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: "text/csv;charset=utf-8;" 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileName = reportType === "month" 
      ? `ThongKe_VangHoc_Thang${String(reportMonth).padStart(2, '0')}_Nam${reportYear}.csv`
      : `ThongKe_VangHoc_Nam${reportYear}.csv`;
    
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Hiển thị thông báo thành công
    const message = `
✅ Đã xuất file thành công!
📄 Tên file: ${fileName}
📊 Số học sinh có chi tiết: ${studentsWithDetails.length}/${absenceReport.length}

💡 Mẹo: Mở file bằng Excel hoặc Google Sheets để xem đẹp hơn!
    `.trim();
    
    alert(message);
  };

  const stats = getStatistics();

  if (loading && !classInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !classInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Xem danh sách lớp chủ nhiệm
              </CardTitle>
              <CardDescription>
                Lớp: <span className="font-semibold">{classInfo?.tenLop}</span> - Sĩ số:{" "}
                <span className="font-semibold">{classInfo?.soHocSinh}</span> học sinh
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Xem điểm danh theo ngày
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'students'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Danh sách lớp
            </button>
            <button
              onClick={() => setActiveTab('absenceReport')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'absenceReport'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Thống kê vắng học
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Nội dung Tab - Xem điểm danh */}
      {activeTab === 'attendance' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Xem điểm danh theo ngày
              </CardTitle>
              <CardDescription>
                Lớp: <span className="font-semibold">{classInfo?.tenLop}</span> - Sĩ số:{" "}
                <span className="font-semibold">{classInfo?.soHocSinh}</span> học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={format(new Date(), "yyyy-MM-dd")}
                />
                <Button onClick={fetchAttendance} disabled={loading}>
                  {loading ? "Đang tải..." : "Xem điểm danh"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {attendanceList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tổng số</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Có mặt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Vắng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách điểm danh - {format(new Date(selectedDate), "dd/MM/yyyy", { locale: vi })}
              </CardTitle>
              <CardDescription>
                {attendanceList.length === 0
                  ? "Chưa có dữ liệu điểm danh cho ngày này"
                  : `Hiển thị ${attendanceList.length} học sinh`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </p>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : attendanceList.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có dữ liệu điểm danh</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Vui lòng chọn ngày khác hoặc chờ giáo vụ điểm danh
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">STT</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã HS</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ và tên</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map((record, index) => (
                        <tr key={record.maDiemDanh} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{record.maHocSinh}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.hoTen}</td>
                          <td className="px-4 py-3">{getStatusBadge(record.trangThai)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.ghiChu || record.lyDo || <span className="text-gray-400 italic">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Nội dung Tab - Danh sách lớp */}
      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách học sinh lớp {classInfo?.tenLop}</CardTitle>
            <CardDescription>
              {studentList.length === 0
                ? "Chưa có dữ liệu học sinh"
                : `Hiển thị ${studentList.length} học sinh`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : studentList.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có dữ liệu học sinh</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">STT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã HS</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày sinh</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giới tính</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Địa chỉ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SĐT Phụ huynh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map((student, index) => (
                      <tr key={student.maHocSinh} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.maHocSinh}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.hoTen}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.ngaySinh ? format(new Date(student.ngaySinh), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.gioiTinh || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.diaChi || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.sdtPhuHuynh || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nội dung Tab - Thống kê vắng học */}
      {activeTab === 'absenceReport' && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê số lần vắng học</CardTitle>
            <CardDescription>
              <span className="flex gap-2 items-center">
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as "month" | "year")}
                  className="border px-2 py-1 rounded"
                >
                  <option value="month">Theo tháng/năm</option>
                  <option value="year">Theo năm</option>
                </select>
                {reportType === "month" && (
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={reportMonth}
                    onChange={e => setReportMonth(Number(e.target.value))}
                    className="border px-2 py-1 rounded w-16"
                  />
                )}
                <input
                  type="number"
                  min={2020}
                  max={new Date().getFullYear()}
                  value={reportYear}
                  onChange={e => setReportYear(Number(e.target.value))}
                  className="border px-2 py-1 rounded w-20"
                />
                <Button onClick={fetchAbsenceReport} disabled={reportLoading}>
                  Xem báo cáo
                </Button>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={handleExportReport}
                  disabled={absenceReport.length === 0}
                >
                  Xuất file CSV
                </Button>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportError && <div className="text-red-600 mb-2">{reportError}</div>}
            {reportLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">STT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Mã HS</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Số lần vắng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-700 border bg-green-50">Vắng có phép</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-red-700 border bg-red-50">Vắng không phép</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absenceReport.map((row, idx) => (
                      <tr key={row.maHocSinh} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm border">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm border font-medium">{row.maHocSinh}</td>
                        <td className="px-4 py-3 text-sm border">{row.hoTen}</td>
                        <td className="px-4 py-3 text-sm border">
                          <span className="font-bold text-red-600">{row.soLanVang}</span>
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          {absenceDetails[row.maHocSinh]?.coPhep ? (
                            <div className="space-y-1">
                              <div className="font-bold text-green-600">
                                {absenceDetails[row.maHocSinh].coPhep.length} buổi
                              </div>
                              {absenceDetails[row.maHocSinh].coPhep.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {absenceDetails[row.maHocSinh].coPhep.map((item: any, i: number) => (
                                    <div key={i} className="mb-1">
                                      • {new Date(item.ngay).toLocaleDateString('vi-VN')}
                                      {item.lyDo && <span className="italic ml-1">({item.lyDo})</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          {absenceDetails[row.maHocSinh]?.khongPhep ? (
                            <div className="space-y-1">
                              <div className="font-bold text-red-600">
                                {absenceDetails[row.maHocSinh].khongPhep.length} buổi
                              </div>
                              {absenceDetails[row.maHocSinh].khongPhep.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {absenceDetails[row.maHocSinh].khongPhep.map((item: any, i: number) => (
                                    <div key={i} className="mb-1">
                                      • {new Date(item.ngay).toLocaleDateString('vi-VN')}
                                      {item.lyDo && <span className="italic ml-1">({item.lyDo})</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAbsenceDates(row.maHocSinh)}
                            disabled={loadingDetails[row.maHocSinh] || absenceDetails[row.maHocSinh]}
                            className="flex items-center gap-1"
                          >
                            <Eye size={14} />
                            {loadingDetails[row.maHocSinh] 
                              ? "Đang tải..." 
                              : absenceDetails[row.maHocSinh]
                              ? "Đã tải"
                              : "Xem chi tiết"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}