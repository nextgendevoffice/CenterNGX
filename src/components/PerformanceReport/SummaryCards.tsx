import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  SparklesIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

interface SummaryCardsProps {
  agentTotal: number;
  companyWl: number;
  memberTotal: number;
  betAmt: number;
  validAmt: number;
}

export default function SummaryCards({
  agentTotal,
  companyWl,
  memberTotal,
  betAmt,
  validAmt
}: SummaryCardsProps) {
  return (
    <div className="space-y-6">
      {/* Glass Effect Header */}
      <div className="backdrop-blur-lg bg-white/30 p-6 rounded-3xl shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          สรุปผลประกอบการ
        </h2>
        <p className="text-gray-600 mt-2">ข้อมูลสรุปผลประกอบการทั้งหมด</p>
      </div>

      {/* Modern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Profit Card */}
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-6 h-6 text-white/80" />
              <h3 className="text-white/80 font-medium">กำไรรวม (Agent)</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-4">
              ฿{agentTotal.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center text-white/80 text-sm">
              {agentTotal > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs((agentTotal / betAmt) * 100).toFixed(2)}% จากยอดเดิมพัน</span>
            </div>
          </div>
        </motion.div>

        {/* Company WL Card */}
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-6 h-6 text-white/80" />
              <h3 className="text-white/80 font-medium">ยอดนำส่ง Company</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-4">
              ฿{companyWl.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Member Total Card */}
        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-6 h-6 text-white/80" />
              <h3 className="text-white/80 font-medium">ยอดเล่นลูกค้า</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-4">
              ฿{memberTotal.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-yellow-400 to-purple-600 rounded-2xl p-6 shadow-lg shadow-purple-500/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white/80 font-medium mb-2">ยอดเดิมพันรวม</h3>
              <p className="text-2xl font-bold text-white">
                ฿{Math.abs(betAmt).toLocaleString()}
              </p>
            </div>
            <SparklesIcon className="w-8 h-8 text-white/30" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, translateY: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-fuchsia-400 to-yellow-600 rounded-2xl p-6 shadow-lg shadow-yellow-500/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white/80 font-medium mb-2">ยอดเดิมพันที่ใช้ได้</h3>
              <p className="text-2xl font-bold text-white">
                ฿{Math.abs(validAmt).toLocaleString()}
              </p>
            </div>
            <SparklesIcon className="w-8 h-8 text-white/30" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 