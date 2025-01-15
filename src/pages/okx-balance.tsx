import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

interface USDTBalance {
  availBal: string;
  bal: string;
  frozenBal: string;
}

export default function OkxBalancePage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usdtRate, setUsdtRate] = useState<number>(0);

  // ดึงข้อมูล USDT Rate
  useEffect(() => {
    const fetchUSDTRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=thb');
        const data = await response.json();
        setUsdtRate(data.tether.thb);
      } catch (error) {
        console.error('Error fetching USDT rate:', error);
      }
    };

    fetchUSDTRate();
    const interval = setInterval(fetchUSDTRate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Query สำหรับดึงข้อมูล USDT Balance
  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['okx-usdt-balance'],
    queryFn: async () => {
      const response = await axios.get('/api/okx/balance');
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      return response.data.data[0] as USDTBalance;
    },
    enabled: isAuthorized,
    refetchInterval: 30000
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@Arm042734726Arm') {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  // แปลง USDT เป็น THB
  const convertToTHB = (usdt: string): string => {
    return (parseFloat(usdt) * usdtRate).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            OKX Balance Checker
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="รหัสผ่าน"
              />
            </div>
            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-4">OKX USDT Balance</h1>
          
          {/* USDT Rate Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">อัตราแลกเปลี่ยน USDT/THB</h2>
            <div className="text-3xl font-bold text-blue-600">
              ฿{usdtRate.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* USDT Balance Card */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : balanceData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-xl font-semibold mb-6">USDT Balance</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ยอดคงเหลือทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-600">{parseFloat(balanceData.bal).toFixed(2)} USDT</p>
                  <p className="text-sm text-gray-500">≈ ฿{convertToTHB(balanceData.bal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">ยอดที่ใช้ได้</p>
                  <p className="text-2xl font-bold text-green-600">{parseFloat(balanceData.availBal).toFixed(2)} USDT</p>
                  <p className="text-sm text-gray-500">≈ ฿{convertToTHB(balanceData.availBal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">ยอดที่ถูก Freeze</p>
                  <p className="text-2xl font-bold text-red-600">{parseFloat(balanceData.frozenBal).toFixed(2)} USDT</p>
                  <p className="text-sm text-gray-500">≈ ฿{convertToTHB(balanceData.frozenBal)}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูล Balance
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 