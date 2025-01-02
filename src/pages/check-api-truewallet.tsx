import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface LoginResponse {
  uid: string;
  access_token: string;
  allow_add_api_keys: string;
  code: number;
  success: boolean;
  message: string;
}

interface BalanceResponse {
  balance: string;
  overdraft: string;
  available_balance: string;
  code: number;
  success: boolean;
  message: string;
}

interface ApiKey {
  key_id: string;
  msisdn: string;
  created: string;
  expire: string;
}

export default function CheckApiTruewalletPage() {
  const [accessToken, setAccessToken] = useState<string>('');
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mutation สำหรับ Login
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<LoginResponse>('/api/truewallet/login');
      return response.data;
    },
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.message);
        return;
      }
      setAccessToken(data.access_token);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  });

  // Mutation สำหรับเช็คยอดเงิน
  const checkBalanceMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await axios.post<BalanceResponse>('/api/truewallet/balance', {
        access_token: token
      });
      return response.data;
    },
    onSuccess: (data) => {
      setBalanceData(data);
    }
  });

  // เพิ่ม mutation สำหรับดึง API Keys
  const checkKeysMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await axios.post('/api/truewallet/check-keys', {
        access_token: token
      });
      return response.data;
    },
    onSuccess: (data) => {
      setApiKeys(data.list || []);
    }
  });

  const handleCheckBalance = async () => {
    try {
      if (!accessToken) {
        const loginData = await loginMutation.mutateAsync();
        if (loginData.access_token) {
          await Promise.all([
            checkBalanceMutation.mutateAsync(loginData.access_token),
            checkKeysMutation.mutateAsync(loginData.access_token)
          ]);
        }
      } else {
        await Promise.all([
          checkBalanceMutation.mutateAsync(accessToken),
          checkKeysMutation.mutateAsync(accessToken)
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ฟังก์ชันสำหรับ filter keys
  const filteredKeys = apiKeys
    .sort((a, b) => {
      // เรียงโดยให้ที่ใช้งานได้ขึ้นก่อน
      if (a.expire === 'หมดอายุแล้ว' && b.expire !== 'หมดอายุแล้ว') return 1;
      if (a.expire !== 'หมดอายุแล้ว' && b.expire === 'หมดอายุแล้ว') return -1;
      return 0;
    })
    .filter(key => {
      // กรอง status
      if (filterStatus === 'active') return key.expire !== 'หมดอายุแล้ว';
      if (filterStatus === 'expired') return key.expire === 'หมดอายุแล้ว';
      return true;
    })
    .filter(key => {
      // ค้นหาจาก key_id หรือ เบอร์
      return key.key_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
             key.msisdn.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">ตรวจสอบ API Truewallet</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleCheckBalance}
            disabled={loginMutation.isPending || checkBalanceMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {(loginMutation.isPending || checkBalanceMutation.isPending) 
              ? 'กำลังตรวจสอบ...' 
              : 'CHECK API TRUEWALLET'}
          </button>

          {balanceData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">ยอดเงินคงเหลือ</h3>
                <p className="text-2xl font-bold text-green-600">฿{balanceData.balance}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">วงเงินที่ใช้ได้</h3>
                <p className="text-2xl font-bold text-blue-600">฿{balanceData.available_balance}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">วงเงินเครดิต</h3>
                <p className="text-2xl font-bold text-gray-600">฿{balanceData.overdraft}</p>
              </div>
            </div>
          )}

          {apiKeys.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold">รายการ API Keys ทั้งหมด</h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="ค้นหา Key ID หรือเบอร์..."
                    className="px-4 py-2 border rounded-md w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="px-4 py-2 border rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="active">ใช้งานได้</option>
                    <option value="expired">หมดอายุ</option>
                  </select>
                </div>
              </div>

              {checkKeysMutation.isPending ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredKeys.length > 0 ? (
                    filteredKeys.map((key) => (
                      <div key={key.key_id} 
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">Key ID:</span>
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{key.key_id}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">เบอร์:</span>
                              <span>{key.msisdn}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              สร้างเมื่อ: {key.created}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            key.expire === 'หมดอายุแล้ว' 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {key.expire === 'หมดอายุแล้ว' ? 'หมดอายุ' : 'ใช้งานได้'}
                          </div>
                        </div>
                        {key.expire !== 'หมดอายุแล้ว' && (
                          <div className="mt-2 text-sm text-gray-500">
                            หมดอายุ: {key.expire}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 