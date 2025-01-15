import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Agent {
  _id: {
    _id: string;
    name: string;
    nickname: string;
    username: string;
  };
  agentTotal: number;
  companyWl: number;
  memberTotal: number;
  betAmt: number;
  validAmt: number;
  winLoseTotal: number;
}

interface PerformanceTableProps {
  agents: Agent[];
}

// เพิ่ม interface สำหรับ USDT rate
interface CoinGeckoResponse {
  tether: {
    thb: number;
  };
}

export default function PerformanceTable({ agents }: PerformanceTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent | 'agentTotal';
    direction: 'asc' | 'desc';
  }>({ key: 'agentTotal', direction: 'desc' });
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [usdtRate, setUsdtRate] = useState<number>(0);

  // ดึงข้อมูล USDT rate จาก CoinGecko
  useEffect(() => {
    const fetchUSDTRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=thb');
        const data: CoinGeckoResponse = await response.json();
        setCurrentRate(data.tether.thb);
        setUsdtRate(data.tether.thb - 0.20);
      } catch (error) {
        console.error('Error fetching USDT rate:', error);
      }
    };

    fetchUSDTRate();
    const interval = setInterval(fetchUSDTRate, 60000);
    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชั่นแปลง THB เป็น USDT
  const convertToUSDT = (thbAmount: number): string => {
    if (!usdtRate) return '0.00';
    const usdt = thbAmount / usdtRate;
    // กำหนดให้แสดงทศนิยม 2 ตำแหน่งเสมอ
    return usdt.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // เรียงลำดับข้อมูล
  const sortedAgents = [...agents].sort((a, b) => {
    if (sortConfig.key === 'agentTotal') {
      return sortConfig.direction === 'asc' 
        ? a.agentTotal - b.agentTotal
        : b.agentTotal - a.agentTotal;
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-600">
            ราคา USDT ปัจจุบัน: ฿{currentRate.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} THB/USDT
          </span>
          <span className="text-sm text-gray-600">
            ราคาที่ใช้คำนวณ (ลบ 0.20): ฿{usdtRate.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} THB/USDT
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="group px-6 py-4 text-left">
                <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>เอเย่นต์</span>
                </div>
              </th>
              <th 
                className="group px-6 py-4 text-right cursor-pointer"
                onClick={() => setSortConfig({
                  key: 'agentTotal',
                  direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })}
              >
                <div className="flex items-center justify-end space-x-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>กำไร</span>
                  <span className="text-gray-400">
                    {sortConfig.key === 'agentTotal' && (
                      <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                    )}
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดนำส่ง Company
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดเล่นลูกค้า
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดเดิมพัน
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดเดิมพันที่ใช้ได้
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win/Lose Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAgents.map((agent) => {
              const winRate = Math.abs((agent.agentTotal / Math.abs(agent.betAmt)) * 100);
              
              return (
                <motion.tr
                  key={agent._id._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {agent._id.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {agent._id.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-medium ${
                        agent.agentTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{agent.agentTotal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({convertToUSDT(agent.agentTotal)} USDT)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">
                      ฿{agent.companyWl.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
                      agent.memberTotal >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ฿{agent.memberTotal.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">
                      ฿{Math.abs(agent.betAmt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">
                      ฿{Math.abs(agent.validAmt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      winRate >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {winRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-medium ${
                        agent.winLoseTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{agent.winLoseTotal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({convertToUSDT(agent.winLoseTotal)} USDT)
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 