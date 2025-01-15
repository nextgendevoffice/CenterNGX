import { motion } from 'framer-motion';

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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 lg:p-6 text-white"
      >
        <h3 className="text-sm lg:text-base font-medium mb-1">กำไรรวม (Agent)</h3>
        <p className="font-bold [font-size:clamp(0.75rem,2.5vw,1.5rem)] leading-tight">
          ฿{agentTotal.toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 lg:p-6 text-white"
      >
        <h3 className="text-sm lg:text-base font-medium mb-1">ยอดนำส่ง Company</h3>
        <p className="font-bold [font-size:clamp(0.75rem,2.5vw,1.5rem)] leading-tight">
          ฿{companyWl.toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 lg:p-6 text-white"
      >
        <h3 className="text-sm lg:text-base font-medium mb-1">ยอดเล่นลูกค้า</h3>
        <p className="font-bold [font-size:clamp(0.75rem,2.5vw,1.5rem)] leading-tight">
          ฿{memberTotal.toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 lg:p-6 text-white"
      >
        <h3 className="text-sm lg:text-base font-medium mb-1">ยอดเดิมพันรวม</h3>
        <p className="font-bold [font-size:clamp(0.75rem,2.5vw,1.5rem)] leading-tight">
          ฿{Math.abs(betAmt).toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 lg:p-6 text-white"
      >
        <h3 className="text-sm lg:text-base font-medium mb-1">ยอดเดิมพันที่ใช้ได้</h3>
        <p className="font-bold [font-size:clamp(0.75rem,2.5vw,1.5rem)] leading-tight">
          ฿{Math.abs(validAmt).toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
} 