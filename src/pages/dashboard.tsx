import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from '@/components/Layout/Header';

export default function DashboardPage() {
  const router = useRouter();

  const menus = [
    {
      title: 'ระบบการเงิน',
      description: 'จัดการระบบการเงินและธนาคาร',
      icon: 'cash-stack',
      color: 'green',
      gradient: 'from-green-500 to-emerald-400',
      submenu: [
        { 
          title: 'Bank List',
          description: 'จัดการรายการธนาคารทั้งหมด', 
          path: '/banks',
          icon: 'bank',
          color: 'green'
        },
        {
          title: 'TrueWallet Status',
          description: 'ตรวจสอบสถานะ TrueWallet',
          path: '/truewallet-status',
          icon: 'wallet',
          color: 'blue'
        },
        {
          title: 'SCB API Tester',
          description: 'ทดสอบการเชื่อมต่อ SCB API',
          path: '/scb-api-tester',
          icon: 'wallet',
          color: 'purple'
        },
        {
          title: 'OKX Balance',
          description: 'ตรวจสอบยอดเงิน OKX',
          path: '/okx-balance',
          icon: 'wallet',
          color: 'blue'
        }
      ]
    },
    {
      title: 'จัดการ Agent',
      description: 'ระบบจัดการตัวแทนและรายงาน',
      icon: 'people',
      color: 'indigo',
      gradient: 'from-indigo-500 to-violet-400',
      submenu: [
        { 
          title: 'Agent Management',
          description: 'จัดการข้อมูลและสิทธิ์ตัวแทน', 
          path: '/agents',
          icon: 'people',
          color: 'indigo'
        },
        {
          title: 'Agent Report',
          description: 'รายงานผลการดำเนินงานของตัวแทน',
          path: '/performance-report',
          icon: 'graph-up',
          color: 'violet'
        }
      ]
    },
    {
      title: 'จัดการระบบ',
      description: 'ตั้งค่าและจัดการระบบ',
      icon: 'gear',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-400',
      submenu: [
        { 
          title: 'จัดการ Domain',
          description: 'จัดการ Domain ทั้งหมดในระบบ', 
          path: '/settings/domains',
          icon: 'globe',
          color: 'cyan'
        },
        {
          title: 'อัพเดทฐานข้อมูล',
          description: 'อัพเดทและจัดการฐานข้อมูล',
          path: '/settings/update-database',
          icon: 'database-gear',
          color: 'blue'
        }
      ]
    },
    {
      title: 'ระบบวันหมดอายุ',
      description: 'จัดการวันหมดอายุและการต่ออายุ',
      icon: 'calendar-check',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-400',
      submenu: [
        {
          title: 'จัดการวันหมดอายุ',
          description: 'ตั้งค่าและจัดการวันหมดอายุ',
          path: '/website-expiration',
          icon: 'calendar',
          color: 'rose'
        },
        {
          title: 'สถานะวันหมดอายุ',
          description: 'ตรวจสอบสถานะการหมดอายุ',
          path: '/expiration-status',
          icon: 'clock-history',
          color: 'pink'
        },
        {
          title: 'ประวัติการต่ออายุ',
          description: 'ดูประวัติการต่ออายุทั้งหมด',
          path: '/expiration-history',
          icon: 'clock',
          color: 'fuchsia'
        }
      ]
    },
    {
      title: 'แดชบอร์ด',
      description: 'ภาพรวมและสถิติของระบบ',
      icon: 'speedometer2',
      color: 'amber',
      path: '/dashboard',
      gradient: 'from-amber-500 to-orange-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-8 text-center"
          >
            ระบบจัดการหลัก
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {menus.map((menu, index) => (
              <motion.div
                key={menu.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${menu.gradient} p-0.5 rounded-2xl`}
              >
                <div className="bg-gray-900 p-6 rounded-2xl h-full backdrop-blur-sm">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`text-${menu.color}-400 p-4 bg-gray-800/50 rounded-xl shadow-lg`}>
                      <i className={`bi bi-${menu.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {menu.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {menu.description}
                      </p>
                    </div>
                  </div>

                  {menu.submenu && (
                    <div className="grid grid-cols-1 gap-3 mt-4 pl-16">
                      {menu.submenu.map((sub) => (
                        <motion.div
                          key={sub.title}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(sub.path)}
                          className="bg-gray-800/50 p-3 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <i className={`bi bi-${sub.icon} text-${sub.color}-400`}></i>
                            <div>
                              <h4 className="text-white font-medium">{sub.title}</h4>
                              <p className="text-gray-400 text-xs">{sub.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {!menu.submenu && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(menu.path)}
                      className="w-full mt-4 bg-gray-800/50 p-2 rounded-xl text-white hover:bg-gray-700/50 transition-colors"
                    >
                      เข้าสู่หน้าแดชบอร์ด
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}