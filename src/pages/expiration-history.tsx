import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '@/components/Loading';

interface HistoryItem {
  id: number;
  days_added: number;
  old_expire_date: string | null;
  new_expire_date: string;
  remark: string;
  created_by: string;
  created_at: string;
}

interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  page: number;
  total_pages: number;
  success: boolean;
}

export default function ExpirationHistoryPage() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ดึงข้อมูล domains
  const { data: domains = [], isLoading: isLoadingDomains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  // ดึงข้อมูลประวัติการต่ออายุ
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['expiration-history', selectedDomain, currentPage],
    queryFn: async () => {
      if (!selectedDomain) return null;
      const response = await axios.get<HistoryResponse>(
        `${selectedDomain}/api/admin/website-expiration/history?page=${currentPage}&limit=${itemsPerPage}`
      );
      return response.data;
    },
    enabled: !!selectedDomain
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-6">ประวัติการต่ออายุ</h1>

          {/* เลือก Domain */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือก Service Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-1/2 rounded-lg border-gray-300"
            >
              <option value="">-- เลือก Domain --</option>
              {domains.map((domain: { url: string; name: string }) => (
                <option key={domain.url} value={domain.url}>
                  {domain.name || domain.url}
                </option>
              ))}
            </select>
          </div>

          {isLoadingDomains || isLoadingHistory ? (
            <Loading text="กำลังโหลดข้อมูล..." />
          ) : !selectedDomain ? (
            <div className="text-center py-12 text-gray-500">
              กรุณาเลือก Domain เพื่อดูประวัติการต่ออายุ
            </div>
          ) : !history?.data.length ? (
            <div className="text-center py-12 text-gray-500">
              ไม่พบประวัติการต่ออายุ
            </div>
          ) : (
            <>
              {/* ตารางประวัติ */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่ดำเนินการ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวนวัน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันหมดอายุเดิม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันหมดอายุใหม่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หมายเหตุ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้ดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {history.data.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.days_added} วัน
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.old_expire_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.new_expire_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.remark || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.created_by === 'system' 
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.created_by}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {history.total_pages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: history.total_pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, history.total_pages))}
                    disabled={currentPage === history.total_pages}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 