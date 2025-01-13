import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'แดชบอร์ด',
    path: '/dashboard',
    icon: 'bi bi-speedometer2'
  },
  {
    title: 'ระบบการเงิน',
    icon: 'bi bi-cash-stack',
    submenu: [
      { 
        title: 'Bank List', 
        path: '/banks',
        icon: 'bi bi-bank'
      },
      {
        title: 'TrueWallet Status',
        path: '/truewallet-status',
        icon: 'bi bi-wallet'
      }
    ]
  },
  {
    title: 'จัดการระบบ',
    icon: 'bi bi-gear',
    submenu: [
      { 
        title: 'จัดการ Domain', 
        path: '/settings/domains',
        icon: 'bi bi-globe'
      },
      { 
        title: 'Agent Management', 
        path: '/agents',
        icon: 'bi bi-people'
      },
      {
        title: 'อัพเดทฐานข้อมูล',
        path: '/settings/update-database',
        icon: 'bi bi-database-gear'
      }
    ]
  },
  {
    title: 'ระบบวันหมดอายุ',
    icon: 'bi bi-calendar-check',
    submenu: [
      {
        title: 'จัดการวันหมดอายุ',
        path: '/website-expiration',
        icon: 'bi bi-calendar'
      },
      {
        title: 'สถานะวันหมดอายุ',
        path: '/expiration-status',
        icon: 'bi bi-clock-history'
      },
      {
        title: 'ประวัติการต่ออายุ',
        path: '/expiration-history',
        icon: 'bi bi-clock'
      }
    ]
  }
];

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-white">
                NGX Center
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {menuItems.map((item) => (
                item.submenu ? (
                  <div key={item.title} className="relative group">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-white/10 transition-all duration-200">
                      <i className={`${item.icon} mr-2`}></i>
                      {item.title}
                      <i className="bi bi-chevron-down ml-2 group-hover:rotate-180 transition-transform duration-200"></i>
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 transform opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className={`block px-4 py-2.5 text-sm ${
                            router.pathname === subItem.path
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          } transition-colors duration-150`}
                        >
                          <i className={`${subItem.icon} mr-2`}></i>
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      router.pathname === item.path
                        ? 'bg-white/20 text-white'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    } transition-all duration-200`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.title}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-white hover:bg-white/10 px-4 py-2 rounded-md transition-all duration-200"
              >
                <i className="bi bi-person-circle text-xl mr-2"></i>
                <span className="hidden md:block">Admin</span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 transform transition-all duration-200">
                  <Link href="/profile" 
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150">
                    <i className="bi bi-person mr-2"></i>
                    โปรไฟล์
                  </Link>
                  <Link href="/settings" 
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150">
                    <i className="bi bi-gear mr-2"></i>
                    ตั้งค่า
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <i className="bi bi-box-arrow-right mr-2"></i>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 