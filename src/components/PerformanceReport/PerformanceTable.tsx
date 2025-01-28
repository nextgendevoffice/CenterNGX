import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import html2canvas from 'html2canvas';

interface Column {
  key: keyof Agent | 'name';
  label: string;
}

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
  startDate: Date;
  endDate: Date;
}

// เพิ่ม interface สำหรับ USDT rate
interface CoinGeckoResponse {
  tether: {
    thb: number;
  };
}

interface SortConfig {
  key: keyof Agent | 'name';
  direction: 'asc' | 'desc';
}

interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

function AgentDetailModal({ agent, isOpen, onClose }: AgentDetailModalProps) {
  if (!agent) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <Dialog.Title className="text-2xl font-bold text-white">
              รายละเอียดเอเย่นต์
            </Dialog.Title>
          </div>

          <div className="p-6 space-y-6">
            {/* Agent Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {agent._id.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{agent._id.name}</h3>
                  <p className="text-gray-500">{agent._id.username}</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">กำไรรวม</h4>
                <p className={`text-2xl font-bold ${
                  agent.agentTotal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ฿{agent.agentTotal.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">ยอดเดิมพัน</h4>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{Math.abs(agent.betAmt).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">ยอดเดิมพันที่ใช้ได้</h4>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{Math.abs(agent.validAmt).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Win Rate</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {((agent.winLoseTotal / Math.abs(agent.betAmt)) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-4">ประสิทธิภาพการทำกำไร</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(Math.max((agent.agentTotal / Math.abs(agent.betAmt)) * 100, 0), 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  const text = `Agent: ${agent._id.name}\nUsername: ${agent._id.username}\nProfit: ${agent.agentTotal}`;
                  navigator.clipboard.writeText(text);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                คัดลอกข้อมูล
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default function PerformanceTable({ agents, startDate, endDate }: PerformanceTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'agentTotal', direction: 'asc' });
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [usdtRate, setUsdtRate] = useState<number>(35); // Default USDT rate
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const columns: Column[] = [
    { key: 'name', label: 'ชื่อเอเย่นต์' },
    { key: 'agentTotal', label: 'กำไรรวม (Agent)' },
    { key: 'companyWl', label: 'ยอดนำส่ง Company' },
    { key: 'memberTotal', label: 'ยอดเล่นลูกค้า' },
    { key: 'betAmt', label: 'ยอดเดิมพัน' },
    { key: 'validAmt', label: 'ยอดเดิมพันที่ใช้ได้' },
    { key: 'winLoseTotal', label: 'Win Rate' },
  ];

  const handleSort = (key: keyof Agent | 'name') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const convertToUSDT = (amount: number): string => {
    if (!usdtRate) return '0.00';
    const usdt = amount / usdtRate;
    return usdt.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const generateCopyText = (agent: Agent) => {
    const today = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedStartDate = startDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedEndDate = endDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `🏆 รายงานผลประกอบการ 🏆
━━━━━━━━━━━━━━━
📊 บิลค่าบริการรอบวันที่ ${formattedStartDate} - ${formattedEndDate}
👤 เอเย่นต์: ${agent._id.name}
💰 ยอดเล่นลูกค้า: ${agent.memberTotal.toLocaleString()} THB
━━━━━━━━━━━━━━━
💵 ราคา USDT ประจำวันที่ ${today}
🔸 Rate: ${usdtRate.toFixed(2)} THB/USDT
🔸 แปลงเป็น: ${convertToUSDT(agent.memberTotal)} USDT
━━━━━━━━━━━━━━━
`;
  };

  const handleCopy = async (agent: Agent) => {
    const textToCopy = generateCopyText(agent);
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('คัดลอกข้อความเรียบร้อยแล้ว');
    } catch (err) {
      console.error('ไม่สามารถคัดลอกข้อความได้:', err);
    }
  };

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

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const aValue = a._id.name.toLowerCase();
      const bValue = b._id.name.toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }

    return 0;
  });

  // ฟังก์ชันสำหรับ capture screenshot
  const captureTable = async () => {
    if (!tableRef.current) return;
    
    try {
      setIsCapturing(true);
      
      // เพิ่ม class สำหรับ styling ขณะ capture
      tableRef.current.classList.add('capturing');
      
      const canvas = await html2canvas(tableRef.current, {
        scale: 2, // เพิ่มความคมชัด
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // สร้าง link สำหรับดาวน์โหลด
      const link = document.createElement('a');
      link.download = `performance-report-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      // ลบ class styling หลัง capture เสร็จ
      if (tableRef.current) {
        tableRef.current.classList.remove('capturing');
      }
      setIsCapturing(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            รายละเอียดผลประกอบการ
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-500">USDT Rate:</span>
              <input
                type="number"
                value={usdtRate}
                onChange={(e) => setUsdtRate(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.01"
              />
              <span className="text-sm text-gray-500">฿</span>
            </div>
            
            <button
              onClick={captureTable}
              disabled={isCapturing}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                ${isCapturing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
            >
              <i className={`bi ${isCapturing ? 'bi-hourglass-split animate-spin' : 'bi-camera'}`}></i>
              <span>{isCapturing ? 'กำลังบันทึก...' : 'Screenshot'}</span>
            </button>

            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <i className="bi bi-download mr-2"></i>
              Export Excel
            </button>
            <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
              <i className="bi bi-printer mr-2"></i>
              Print
            </button>
          </div>
        </div>
        
        <div className="mb-4 text-sm text-gray-500 flex items-center space-x-2">
          <i className="bi bi-info-circle"></i>
          <span>อัตราแลกเปลี่ยน: 1 USDT = {usdtRate} บาท</span>
        </div>
        
        <div ref={tableRef} className="relative">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:text-indigo-600 transition-colors">
                          {column.label}
                        </span>
                        {sortConfig.key === column.key && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-indigo-500"
                          >
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </motion.span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedAgents.map((agent, index) => (
                  <motion.tr
                    key={agent._id._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                            {agent._id.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agent._id.name}</div>
                          <div className="text-sm text-gray-500">{agent._id.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        agent.agentTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{agent.agentTotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({convertToUSDT(agent.agentTotal)} USDT)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        agent.companyWl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{agent.companyWl.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({convertToUSDT(agent.companyWl)} USDT)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        agent.memberTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ฿{agent.memberTotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({convertToUSDT(agent.memberTotal)} USDT)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ฿{Math.abs(agent.betAmt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        ({convertToUSDT(Math.abs(agent.betAmt))} USDT)
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${(Math.abs(agent.validAmt) / Math.abs(agent.betAmt)) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ฿{Math.abs(agent.validAmt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({convertToUSDT(Math.abs(agent.validAmt))} USDT)
                      </div>
                      <div className="text-xs text-gray-500">
                        {((Math.abs(agent.validAmt) / Math.abs(agent.betAmt)) * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        agent.winLoseTotal >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {((agent.winLoseTotal / Math.abs(agent.betAmt)) * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ฿{agent.winLoseTotal.toLocaleString()}
                        <br />
                        ({convertToUSDT(agent.winLoseTotal)} USDT)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 justify-end">
                        <button
                          onClick={() => handleCopy(agent)}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <i className="bi bi-clipboard mr-1"></i>
                          คัดลอก
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <i className="bi bi-eye mr-1"></i>
                          ดูรายละเอียด
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overlay while capturing */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="text-indigo-600 font-medium">กำลังบันทึกภาพ...</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            แสดง {sortedAgents.length} รายการ จากทั้งหมด {agents.length} รายการ
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              ก่อนหน้า
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
              ถัดไป
            </button>
          </div>
        </div>
      </div>
      
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAgent(null);
        }}
      />
    </div>
  );
} 