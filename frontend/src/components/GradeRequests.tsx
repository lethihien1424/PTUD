import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { GradeRequest } from '../App';
import { GradeRequestList } from './GradeRequestList';
import { GradeRequestDetail } from './GradeRequestDetail';

const API = 'http://localhost:3000/api/grade-requests';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : { headers: {} };
};

export default function GradeRequests() {
  const [requests, setRequests] = useState<GradeRequest[]>([]);
  const [selected, setSelected] = useState<GradeRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/`, getAuthHeader());
      // backend responds { success: true, data: [...] }
      const payload = res.data;
      const raw = (payload && payload.data) || [];

      // Normalize status values so list and detail components use the same strings
      const mapStatus = (s: any) => {
        if (!s) return s;
        const lower = String(s).toLowerCase();
        if (lower === 'pending' || lower === 'pendiente') return 'Chờ duyệt';
        if (lower === 'approved' || lower === 'approve') return 'Đã duyệt';
        if (lower === 'rejected' || lower === 'reject') return 'Từ chối';
        // Already Vietnamese or unknown - return original
        return s;
      };

      const normalized = raw.map((r: any) => ({ ...r, status: mapStatus(r.status) }));
      setRequests(normalized);
      toast.success('Tải danh sách phiếu thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tải phiếu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Duyệt phiếu này chứ?')) return;
    setProcessing(true);
    try {
      await axios.put(`${API}/${id}/approve`, {}, getAuthHeader());
      toast.success('Duyệt phiếu thành công');
      await fetchRequests();
      setSelected(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi duyệt phiếu');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Từ chối phiếu này chứ?')) return;
    setProcessing(true);
    try {
      await axios.put(`${API}/${id}/reject`, {}, getAuthHeader());
      toast.success('Từ chối phiếu thành công');
      await fetchRequests();
      setSelected(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi từ chối phiếu');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Requests list panel */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Danh sách Phiếu sửa điểm</h3>
              <span className="text-sm text-gray-500">{requests.length} phiếu</span>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <GradeRequestList
                requests={requests}
                selectedRequest={selected}
                onSelectRequest={(r) => setSelected(r)}
              />
            </div>
          </div>
        </div>

        {/* Right: Detail panel */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Chi tiết Phiếu</h3>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {selected ? (
                <GradeRequestDetail
                  request={selected}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processing}
                />
              ) : (
                <div className="h-full rounded-md border-2 border-dashed border-gray-200 bg-white/50 flex items-center justify-center text-gray-500">
                  Chọn một phiếu để xem chi tiết
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
