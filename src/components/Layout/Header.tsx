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
    title: 'Bank List', 
    path: '/banks',
    icon: 'bi bi-bank'
  },
  { 
    title: 'จัดการ Domain', 
    path: '/settings/domains',
    icon: 'bi bi-globe'
  },
];

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
            
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                NGX Center
              </span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.path
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <i className="bi bi-person-circle text-xl mr-2"></i>
                <span className="hidden md:block">Admin</span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="bi bi-person mr-2"></i>
                    โปรไฟล์
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="bi bi-gear mr-2"></i>
                    ตั้งค่า
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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