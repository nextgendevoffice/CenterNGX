import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // เช็คสถานะจาก cookie แทน localStorage
    const isAuth = document.cookie.includes('isAuthenticated=true');
    setIsAuthenticated(isAuth);
  }, []);

  const login = async (password: string) => {
    if (password === '@Aa123456Aa') {
      setIsAuthenticated(true);
      // ตั้งค่า cookie แบบ HTTP-only
      document.cookie = 'isAuthenticated=true; path=/; max-age=86400; secure';
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    // ลบ cookie
    document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 