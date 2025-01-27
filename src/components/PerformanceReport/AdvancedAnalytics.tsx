import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { Line, Bar } from 'react-chartjs-2';

interface AdvancedAnalyticsProps {
  data: {
    agents: Array<{
      _id: {
        name: string;
      };
      agentTotal: number;
      betAmt: number;
      memberTotal: number;
      validAmt: number;
    }>;
  };
}

export default function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  // คำนวณ ROI เฉลี่ย
  const averageROI = data.agents.reduce((sum, agent) => {
    return sum + (agent.agentTotal / Math.abs(agent.betAmt)) * 100;
  }, 0) / data.agents.length;

  // คำนวณ Win Rate เฉลี่ย
  const averageWinRate = (data.agents.reduce((sum, agent) => {
    return sum + (agent.agentTotal > 0 ? 1 : 0);
  }, 0) / data.agents.length) * 100;

  // ฟังก์ชันกำหนดระดับความเสี่ยง
  const getRiskLevel = (roi: number) => {
    if (roi > 5) return 'ต่ำ';
    if (roi > 0) return 'ปานกลาง';
    return 'สูง';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Risk Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-indigo-600" />
          การวิเคราะห์ความเสี่ยง
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ROI Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">ROI เฉลี่ย</h3>
            <p className="text-2xl font-bold text-blue-900">{averageROI.toFixed(2)}%</p>
          </div>

          {/* Win Rate Analysis */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Win Rate เฉลี่ย</h3>
            <p className="text-2xl font-bold text-green-900">{averageWinRate.toFixed(2)}%</p>
          </div>

          {/* Risk Level */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">ระดับความเสี่ยง</h3>
            <p className="text-2xl font-bold text-yellow-900">
              {getRiskLevel(averageROI)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Agent Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-2 text-purple-600" />
          ประสิทธิภาพของเอเย่นต์
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-2">เอเย่นต์ที่มีผลงานดีที่สุด</h3>
            <div className="space-y-2">
              {data.agents
                .sort((a, b) => b.agentTotal - a.agentTotal)
                .slice(0, 3)
                .map((agent, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-purple-900">{agent._id.name}</span>
                    <span className="font-semibold text-purple-900">
                      ฿{agent.agentTotal.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">เอเย่นต์ที่ต้องปรับปรุง</h3>
            <div className="space-y-2">
              {data.agents
                .sort((a, b) => a.agentTotal - b.agentTotal)
                .slice(0, 3)
                .map((agent, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-red-900">{agent._id.name}</span>
                    <span className="font-semibold text-red-900">
                      ฿{agent.agentTotal.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Betting Pattern Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ClockIcon className="w-6 h-6 mr-2 text-emerald-600" />
          การวิเคราะห์รูปแบบการเดิมพัน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Betting Volume */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">ปริมาณการเดิมพันเฉลี่ย</h3>
            <p className="text-2xl font-bold text-emerald-900">
              ฿{(data.agents.reduce((sum, agent) => sum + Math.abs(agent.betAmt), 0) / data.agents.length).toLocaleString()}
            </p>
          </div>

          {/* Valid Betting Ratio */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-cyan-800 mb-2">อัตราส่วนเดิมพันที่ใช้ได้</h3>
            <p className="text-2xl font-bold text-cyan-900">
              {((data.agents.reduce((sum, agent) => sum + Math.abs(agent.validAmt), 0) / 
                data.agents.reduce((sum, agent) => sum + Math.abs(agent.betAmt), 0)) * 100).toFixed(2)}%
            </p>
          </div>

          {/* Average Member Performance */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-teal-800 mb-2">ผลงานลูกค้าเฉลี่ย</h3>
            <p className="text-2xl font-bold text-teal-900">
              ฿{(data.agents.reduce((sum, agent) => sum + agent.memberTotal, 0) / data.agents.length).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 