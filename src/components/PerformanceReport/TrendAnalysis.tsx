import { motion } from 'framer-motion';
import { 
  ChartPieIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/solid';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ลงทะเบียน ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TrendAnalysisProps {
  data: {
    agents: Array<{
      _id: {
        name: string;
      };
      agentTotal: number;
      betAmt: number;
      memberTotal: number;
      validAmt: number;
      winLoseTotal: number;
    }>;
  };
}

export default function TrendAnalysis({ data }: TrendAnalysisProps) {
  // ข้อมูลสำหรับ Market Share Chart
  const marketShareData = {
    labels: data.agents.map(agent => agent._id.name),
    datasets: [
      {
        data: data.agents.map(agent => Math.abs(agent.betAmt)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  // ข้อมูลสำหรับ Performance Distribution
  const performanceData = {
    labels: ['กำไรสูง', 'กำไรปานกลาง', 'กำไรต่ำ', 'ขาดทุน'],
    datasets: [
      {
        data: [
          data.agents.filter(a => a.agentTotal > 50000).length,
          data.agents.filter(a => a.agentTotal > 10000 && a.agentTotal <= 50000).length,
          data.agents.filter(a => a.agentTotal > 0 && a.agentTotal <= 10000).length,
          data.agents.filter(a => a.agentTotal <= 0).length,
        ],
        backgroundColor: [
          'rgba(72, 187, 120, 0.8)',
          'rgba(66, 153, 225, 0.8)',
          'rgba(246, 224, 94, 0.8)',
          'rgba(245, 101, 101, 0.8)',
        ],
      },
    ],
  };

  // แก้ไขส่วนที่มีปัญหา
  const getTopMarketAgent = () => {
    if (!data?.agents || data.agents.length === 0) return 'ไม่มีข้อมูล';
    
    const topAgent = data.agents.reduce((prev, current) => {
      if (!prev || !current) return prev;
      return Math.abs(prev.betAmt) > Math.abs(current.betAmt) ? prev : current;
    }, data.agents[0]);

    return topAgent?._id?.name || 'ไม่พบข้อมูล';
  };

  // ใช้ฟังก์ชันแทนการเรียกโดยตรง
  const topMarketAgent = getTopMarketAgent();

  return (
    <div className="space-y-6 mb-8">
      {/* Market Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <ChartPieIcon className="w-6 h-6 mr-2 text-blue-600" />
          การวิเคราะห์ส่วนแบ่งตลาด
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <Pie data={marketShareData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">ข้อมูลเชิงลึก</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                • เอเย่นต์ที่มีส่วนแบ่งตลาดสูงสุด: {topMarketAgent}
              </p>
              <p className="text-sm text-gray-600">
                • จำนวนเอเย่นต์ที่มีกำไร: {
                  data.agents.filter(a => a?.agentTotal > 0).length
                } จาก {data.agents.length}
              </p>
              <p className="text-sm text-gray-600">
                • อัตราการเติบโตเฉลี่ย: {
                  ((data.agents.reduce((sum, agent) => sum + agent.agentTotal, 0) / 
                    Math.abs(data.agents.reduce((sum, agent) => sum + agent.betAmt, 0))) * 100
                  ).toFixed(2)
                }%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <PresentationChartLineIcon className="w-6 h-6 mr-2 text-green-600" />
          การกระจายตัวของผลประกอบการ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <Pie data={performanceData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">สรุปผลประกอบการ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">กำไรสูง</p>
                <p className="text-2xl font-bold text-green-900">
                  {data.agents.filter(a => a.agentTotal > 50000).length} ราย
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">กำไรปานกลาง</p>
                <p className="text-2xl font-bold text-blue-900">
                  {data.agents.filter(a => a.agentTotal > 10000 && a.agentTotal <= 50000).length} ราย
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">กำไรต่ำ</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {data.agents.filter(a => a.agentTotal > 0 && a.agentTotal <= 10000).length} ราย
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">ขาดทุน</p>
                <p className="text-2xl font-bold text-red-900">
                  {data.agents.filter(a => a.agentTotal <= 0).length} ราย
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 