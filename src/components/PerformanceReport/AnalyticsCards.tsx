import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface AnalyticsData {
  agents: Array<{
    _id: {
      name: string;
      username: string;
    };
    agentTotal: number;
    betAmt: number;
    validAmt: number;
    memberTotal: number;
  }>;
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
}

export default function AnalyticsCards({ data }: AnalyticsCardsProps) {
  // ตรวจสอบว่ามีข้อมูล agents หรือไม่
  if (!data?.agents?.length) {
    return null;
  }

  // คำนวณ Agent ที่มีกำไรสูงสุด
  const topProfitAgent = [...data.agents].sort((a, b) => b.agentTotal - a.agentTotal)[0];

  // คำนวณ Agent ที่มีขาดทุนมากที่สุด
  const topLossAgent = [...data.agents].sort((a, b) => a.agentTotal - b.agentTotal)[0];

  // คำนวณ Win Rate เฉลี่ย
  const averageWinRate = data.agents.reduce((sum, agent) => {
    const winRate = (agent.agentTotal / Math.abs(agent.betAmt || 1)) * 100;
    return sum + winRate;
  }, 0) / data.agents.length;

  // คำนวณ Agent ที่มียอดเดิมพันสูงสุด
  const topBetAgent = [...data.agents].sort((a, b) => Math.abs(b.betAmt) - Math.abs(a.betAmt))[0];

  // คำนวณสัดส่วนยอดเดิมพันที่ใช้ได้ต่อยอดเดิมพันทั้งหมด
  const totalValidBetRatio = (
    data.agents.reduce((sum, agent) => sum + Math.abs(agent.validAmt || 0), 0) /
    data.agents.reduce((sum, agent) => sum + Math.abs(agent.betAmt || 1), 0)
  ) * 100;

  // นับจำนวน Agent ที่มีกำไร
  const profitableAgentsCount = data.agents.filter(agent => agent.agentTotal > 0).length;
  const profitableAgentsRatio = (profitableAgentsCount / data.agents.length) * 100;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">การวิเคราะห์ผลประกอบการ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Performers Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-medium mb-4">Top Performers</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Agent ที่มีกำไรสูงสุด</span>
              <div className="text-right">
                <div className="text-green-600 font-medium">
                  {topProfitAgent?._id?.name || 'ไม่มีข้อมูล'}
                </div>
                <div className="text-sm text-gray-500">
                  ฿{topProfitAgent?.agentTotal?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Agent ที่มียอดเดิมพันสูงสุด</span>
              <div className="text-right">
                <div className="text-blue-600 font-medium">
                  {topBetAgent?._id?.name || 'ไม่มีข้อมูล'}
                </div>
                <div className="text-sm text-gray-500">
                  ฿{Math.abs(topBetAgent?.betAmt || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-medium mb-4">ตัวชี้วัดประสิทธิภาพ</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Win Rate เฉลี่ย</span>
              <div className="flex items-center">
                {averageWinRate >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${
                  averageWinRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(averageWinRate || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">สัดส่วน Agent ที่มีกำไร</span>
              <div className="flex items-center">
                <span className={`font-medium ${
                  profitableAgentsRatio >= 50 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profitableAgentsRatio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Analysis Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-medium mb-4">การวิเคราะห์ความเสี่ยง</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Agent ที่ขาดทุนมากที่สุด</span>
              <div className="text-right">
                <div className="text-red-600 font-medium">
                  {topLossAgent?._id?.name || 'ไม่มีข้อมูล'}
                </div>
                <div className="text-sm text-gray-500">
                  ฿{Math.abs(topLossAgent?.agentTotal || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">สัดส่วนยอดเดิมพันที่ใช้ได้</span>
              <div className="flex items-center">
                {totalValidBetRatio < 90 && (
                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-500 mr-1" />
                )}
                <span className={`font-medium ${
                  totalValidBetRatio >= 90 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {totalValidBetRatio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 