import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface Domain {
  url: string;
  name: string;
}

// เพิ่ม interface ExpirationResponse
interface ExpirationResponse {
  message: string;
  data: {
    days_added: number;
    old_expire_date: string;
    new_expire_date: string;
    next_billing_date: string;
  };
  success: boolean;
}

interface ExpirationFormData {
  serviceUrl: string;
  remark: string;
  created_by_name: string;
}

export default function WebsiteExpirationPage() {
  const [formData, setFormData] = useState<ExpirationFormData>({
    serviceUrl: '',
    remark: '',
    created_by_name: ''
  });

  // ดึงข้อมูล domains
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  // Mutation สำหรับอัพเดทวันหมดอายุ
  const updateExpiration = useMutation({
    mutationFn: async (data: ExpirationFormData) => {
      const response = await axios.post<ExpirationResponse>(`${data.serviceUrl}/api/admin/website-expiration/add`, {
        remark: data.remark,
        created_by_name: data.created_by_name
      });
      return response.data;
    },
    onSuccess: (response) => {
      // แสดง Popup แทน Modal
      Swal.fire({
        title: response.message,
        html: `
          <div class="space-y-3 text-left">
            <div>
              <p class="text-sm text-gray-600">จำนวนวันที่เพิ่ม:</p>
              <p class="font-medium">${response.data.days_added} วัน</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันหมดอายุเดิม:</p>
              <p class="font-medium">${new Date(response.data.old_expire_date).toLocaleDateString('th-TH')}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันหมดอายุใหม่:</p>
              <p class="font-medium">${new Date(response.data.new_expire_date).toLocaleDateString('th-TH')}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันที่ต้องต่ออายุครั้งถัดไป:</p>
              <p class="font-medium">${new Date(response.data.next_billing_date).toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#3B82F6', // blue-600
      });

      setFormData({
        serviceUrl: '',
        remark: '',
        created_by_name: ''
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดท',
        icon: 'error',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#EF4444', // red-500
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceUrl || !formData.created_by_name) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    updateExpiration.mutate(formData);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h1 className="text-2xl font-semibold mb-6">อัพเดทวันหมดอายุเว็บไซต์</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* เลือก Service URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service URL
              </label>
              <select
                value={formData.serviceUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceUrl: e.target.value }))}
                className="w-full rounded-lg border-gray-300"
                required
              >
                <option value="">เลือก Service URL</option>
                {domains.map((domain: Domain) => (
                  <option key={domain.url} value={domain.url}>
                    {domain.name || domain.url}
                  </option>
                ))}
              </select>
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <input
                type="text"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                className="w-full rounded-lg border-gray-300"
                placeholder="ระบุหมายเหตุ (ไม่บังคับ)"
              />
            </div>

            {/* ชื่อผู้อัพเดท */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อผู้อัพเดท
              </label>
              <input
                type="text"
                value={formData.created_by_name}
                onChange={(e) => setFormData(prev => ({ ...prev, created_by_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300"
                placeholder="ระบุชื่อผู้อัพเดท"
                required
              />
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updateExpiration.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateExpiration.isPending ? 'กำลังอัพเดท...' : 'อัพเดทวันหมดอายุ'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 