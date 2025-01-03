import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from 'react-bootstrap';

interface DomainStatus {
  domain: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

interface TrueWalletResponse {
  message: string;
  data?: {
    deposit: {
      account: string;
      balance: string;
      transactions: any[];
    };
    withdraw: any;
  };
  errors?: string[];
  success: boolean;
  keyInfo?: {
    key_id: string;
    msisdn: string;
    created: string;
    expire: string;
  } | null;
}

export default function TrueWalletStatusPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<TrueWalletResponse | null>(null);

  // ดึงข้อมูล domains จาก API
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  // Mutation สำหรับเช็คสถานะ
  const checkStatus = useMutation({
    mutationFn: async (domain: string) => {
      try {
        // 1. เรียก API เพื่อดึง transactions
        const response = await axios.get<TrueWalletResponse>(`${domain}/api/admin/save_tw_app`);
        const transactionData = response.data;
        
        if (transactionData.success && transactionData.data?.deposit?.account) {
          // 2. ดึง 5 ตัวท้ายของเบอร์
          const last5Digits = transactionData.data.deposit.account.slice(-5);
          
          // 3. เรียก API เพื่อดึงข้อมูล key
          const loginResponse = await axios.post('/api/truewallet/login');
          const accessToken = loginResponse.data.access_token;
          
          // 4. เรียก API ผ่าน route ใหม่
          const keysResponse = await axios.post('/api/truewallet/check-keys', {
            access_token: accessToken
          });

          // 5. ค้นหาข้อมูลที่ตรงกับ 5 ตัวท้าย
          const matchedKey = keysResponse.data.list.find((key: any) => 
            key.msisdn.endsWith(last5Digits)
          );

          return {
            ...transactionData,
            keyInfo: matchedKey || null
          };
        }

        return transactionData;
      } catch (error) {
        // จัดการ error เหมือนเดิม
        if (axios.isAxiosError(error) && error.response) {
          return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
            errors: error.response.data?.errors || error.response.data?.message || 'ไม่สามารถเชื่อมต่อกับระบบได้',
          } as TrueWalletResponse;
        } else {
          return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 
            errors: ['ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'],
          } as TrueWalletResponse;
        }
      }
    },
    onSuccess: (data) => {
      setModalData(data);
      setIsModalOpen(true);
    }
  });

  const handleCheck = (domain: string) => {
    checkStatus.mutate(domain);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">เช็คสถานะ TrueWallet</h1>
          <div className="flex gap-4 items-center">
            <Button 
              href="/check-api-truewallet" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <i className="bi bi-key-fill mr-2"></i>
              ตรวจสอบ API Keys
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              <i className="bi bi-arrow-clockwise mr-2"></i>
              รีเฟรช
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">รายการโดเมน</h2>
            <p className="mt-1 text-sm text-gray-500">
              เลือกโดเมนที่ต้องการตรวจสอบสถานะ TrueWallet
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {domains.map((domain: { url: string; name: string }) => (
              <div 
                key={domain.url} 
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{domain.name || domain.url}</h3>
                  <p className="mt-1 text-sm text-gray-500">{domain.url}</p>
                </div>
                <button
                  onClick={() => handleCheck(domain.url)}
                  disabled={checkStatus.isPending}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {checkStatus.isPending ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                        <i className="bi bi-arrow-repeat"></i>
                      </div>
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search mr-2"></i>
                      เช็คสถานะ
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {domains.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <i className="bi bi-inbox text-3xl mb-2"></i>
              <p>ไม่พบรายการโดเมน</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">ผลการตรวจสอบ</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                {modalData && (
                  <>
                    <div className={`p-4 rounded-lg mb-4 ${
                      modalData.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <i className={`bi ${modalData.success ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                        <span>{modalData.message}</span>
                      </div>
                    </div>

                    {modalData.success && modalData.data?.deposit && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">ข้อมูลบัญชี</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">เบอร์วอลเล็ท</p>
                              <p className="font-medium">{modalData.data.deposit.account}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">ยอดเงินคงเหลือ</p>
                              <p className="font-medium">฿{modalData.data.deposit.balance}</p>
                            </div>
                          </div>
                        </div>

                        {modalData.data.deposit.transactions?.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2">รายการล่าสุด</h3>
                            <div className="space-y-2">
                              {modalData.data.deposit.transactions.slice(0, 5).map((tx, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{tx.title}</p>
                                      <p className="text-sm text-gray-500">{tx.sub_title || '-'}</p>
                                    </div>
                                    <div className={`font-medium ${
                                      tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {tx.amount}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{tx.date_time}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {modalData.errors && (
                      <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
                        <h3 className="font-medium mb-2">ข้อผิดพลาด</h3>
                        {Array.isArray(modalData.errors) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {modalData.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{modalData.errors}</p>
                        )}
                      </div>
                    )}

                    {modalData?.keyInfo && (
                      <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-bold">ข้อมูล API Key:</h3>
                        <p>Key ID: {modalData.keyInfo.key_id}</p>
                        <p>เบอร์: {modalData.keyInfo.msisdn}</p>
                        <p>วันที่สร้าง: {modalData.keyInfo.created}</p>
                        <p>วันหมดอายุ: {modalData.keyInfo.expire}</p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        ปิด
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div 
              className="absolute inset-0 z-[-1]" 
              onClick={() => setIsModalOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 