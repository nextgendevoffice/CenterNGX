import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Chart } from 'react-chartjs-2';
import Header from '@/components/Layout/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Protected Route
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const stats = [
    { label: 'บัญชีทั้งหมด', value: '2,345', icon: 'bank', color: 'blue' },
    { label: 'บัญชีที่ใช้งาน', value: '1,234', icon: 'check-circle', color: 'green' },
    { label: 'ยอดเงินรวม', value: '฿1,234,567', icon: 'cash', color: 'yellow' },
    { label: 'Domains', value: '12', icon: 'globe', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className={`text-${stat.color}-500 mb-2`}>
                  <i className={`bi bi-${stat.icon} text-2xl`}></i>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* เพิ่มกราฟและข้อมูลอื่นๆ ตามต้องการ */}
        </div>
      </div>
    </div>
  );
} 