import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';

interface Agent {
  username: string;
  name: string;
  credit: number;
  lastLogin: {
    date: string;
    ip: string;
  };
}

interface DepositResponse {
  code: number;
  data: {
    afterCredit: number;
    beforeCredit: number;
  };
  msg: string;
}

interface ProfileResponse {
  code: number;
  data: {
    balance: {
      THB: {
        balance: {
          $numberDecimal: string;
        };
      };
    };
  };
  msg: string;
}

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent | 'lastLogin.date';
    direction: 'asc' | 'desc';
  }>({ key: 'credit', direction: 'desc' });
  const [accessToken, setAccessToken] = useState<string>('');

  // Query สำหรับดึงข้อมูล Agent
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      // 1. Login เพื่อรับ token
      const loginResponse = await axios.post('https://walrus-app-5ugwj.ondigitalocean.app/login', {
        username: "df88a@ngxbot",
        password: "@Aa123456Aa"
      });
      
      const token = loginResponse.data.token;
      setAccessToken(token);
      
      // 2. ใช้ token เพื่อดึงข้อมูล agents
      const agentsResponse = await axios.post('https://walrus-app-5ugwj.ondigitalocean.app/creditag', {
        token
      });
      
      return agentsResponse.data.data;
    }
  });

  // คำนวณยอดรวม credit
  const totalCredit = agents.reduce((sum: number, agent: Agent) => sum + agent.credit, 0);
  
  // กรองและเรียงลำดับข้อมูล
  const filteredAndSortedAgents = [...agents]
    .filter((agent: Agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Agent, b: Agent) => {
      const key = sortConfig.key;
      if (key === 'lastLogin.date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.lastLogin.date).getTime() - new Date(b.lastLogin.date).getTime()
          : new Date(b.lastLogin.date).getTime() - new Date(a.lastLogin.date).getTime();
      }
      return sortConfig.direction === 'asc'
        ? (a[key] > b[key] ? 1 : -1)
        : (b[key] > a[key] ? 1 : -1);
    });

  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: async ({ username, amount, token, passcode }: { 
      username: string;
      amount: number;
      token: string;
      passcode: string;
    }) => {
      const response = await axios.post<DepositResponse>('https://walrus-app-5ugwj.ondigitalocean.app/deposit', {
        token,
        username,
        cur: 'THB',
        amount,
        passcode
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const DepositModal: React.FC<{
    agent: Agent;
    token: string;
    isOpen: boolean;
    onClose: () => void;
  }> = ({ agent, token, isOpen, onClose }) => {
    const [amount, setAmount] = useState<string>('');
    const [passcode, setPasscode] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!amount || isNaN(Number(amount))) return;
      if (!passcode) {
        toast.error('กรุณาระบุ Passcode');
        return;
      }

      try {
        await depositMutation.mutateAsync({
          username: agent.username,
          amount: Number(amount),
          token,
          passcode
        });
        onClose();
        toast.success('เติมเครดิตสำเร็จ');
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการเติมเครดิต');
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">เติมเครดิต - {agent.name}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนเงิน (THB)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border-gray-300"
                placeholder="ระบุจำนวนเงิน"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full rounded-lg border-gray-300"
                placeholder="ระบุ Passcode"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={depositMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {depositMutation.isPending ? 'กำลังทำรายการ...' : 'ยืนยัน'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  // เพิ่ม query สำหรับดึงข้อมูล profile
  const { data: profileData } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      const response = await axios.post<ProfileResponse>('https://walrus-app-5ugwj.ondigitalocean.app/get-profile', {
        token: accessToken
      });
      return response.data;
    },
    enabled: !!accessToken
  });

  const remainingCredit = profileData?.data?.balance?.THB?.balance?.$numberDecimal || '0';

  return (
    <div className="py-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="กำลังโหลดข้อมูล..." />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-4">Agent Management</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-medium mb-2">จำนวน Agent ทั้งหมด</h3>
                <p className="text-3xl font-bold">{agents.length}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-medium mb-2">เครดิตรวมทั้งหมด</h3>
                <p className="text-3xl font-bold">฿{totalCredit.toLocaleString()}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-medium mb-2">เครดิตคงเหลือ</h3>
                <p className="text-3xl font-bold">฿{Number(remainingCredit).toLocaleString()}</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-medium mb-2">Active Agents</h3>
                <p className="text-3xl font-bold">
                  {agents.filter((a: Agent) => a.credit > 0).length}
                </p>
              </motion.div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="ค้นหาจากชื่อหรือ username..."
                    className="w-full rounded-lg border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Agents Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ชื่อ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        เครดิต
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        เข้าสู่ระบบล่าสุด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedAgents.map((agent: Agent) => (
                      <motion.tr
                        key={agent.username}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {agent.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`font-medium ${
                            agent.credit > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ฿{agent.credit.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(agent.lastLogin.date).toLocaleString('th-TH')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.lastLogin.ip}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => setSelectedAgent(agent)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                          >
                            <i className="bi bi-plus-circle mr-1"></i>
                            เติมเครดิต
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedAgent && (
        <DepositModal
          agent={selectedAgent}
          token={accessToken}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}