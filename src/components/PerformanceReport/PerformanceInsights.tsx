import { motion } from 'framer-motion';
import { ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface InsightsProps {
  data: {
    topAgent: {
      name: string;
      profit: number;
    };
    profitMargin: number;
    totalRevenue: number;
  };
}

export default function PerformanceInsights({ data }: InsightsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2" />
        Performance Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80">Top Performing Agent</h3>
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{data.topAgent.name}</p>
          <p className="text-green-400">฿{data.topAgent.profit.toLocaleString()}</p>
        </motion.div>
        
        {/* เพิ่ม insights cards อื่นๆ */}
      </div>
    </div>
  );
} 