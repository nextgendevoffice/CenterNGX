import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Loading from '@/components/Loading';

interface ExpirationData {
  expire_date: string;
  days_left: number;
  hours_left: number;
  minutes_left: number;
  is_expired: boolean;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
}

interface ServiceExpiration {
  url: string;
  name: string;
  expiration?: ExpirationData;
  error?: string;
}

export default function ExpirationStatusPage() {
  const [services, setServices] = useState<ServiceExpiration[]>([]);
  
  // ดึงข้อมูล domains
  const { data: domains = [], isLoading: isLoadingDomains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  // ดึงข้อมูล expiration สำหรับแต่ละ domain
  const fetchExpirationData = async () => {
    const servicesData = await Promise.all(
      domains.map(async (domain: { url: string; name: string }) => {
        try {
          const response = await axios.get(`${domain.url}/api/admin/website-expiration`);
          return {
            ...domain,
            expiration: response.data.data
          };
        } catch (error) {
          return {
            ...domain,
            error: 'ไม่สามารถดึงข้อมูลได้'
          };
        }
      })
    );
    setServices(servicesData);
  };

  useEffect(() => {
    if (domains.length > 0) {
      fetchExpirationData();
      // อัพเดททุก 1 นาที
      const interval = setInterval(fetchExpirationData, 60000);
      return () => clearInterval(interval);
    }
  }, [domains]);

  if (isLoadingDomains) {
    return <Loading text="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">สถานะวันหมดอายุ</h1>
          <button
            onClick={fetchExpirationData}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            รีเฟรช
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                service.error
                  ? 'border-red-500'
                  : service.expiration?.is_expired
                  ? 'border-red-500'
                  : (service.expiration?.days_left ?? 0) < 30
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{service.name || service.url}</h3>
                  <p className="text-sm text-gray-500">{service.url}</p>
                </div>
                {service.expiration?.is_expired && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    หมดอายุแล้ว
                  </span>
                )}
              </div>

              {service.error ? (
                <div className="text-red-500 text-sm">
                  <i className="bi bi-exclamation-triangle mr-2"></i>
                  {service.error}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">วันหมดอายุ:</div>
                    <div className="font-medium">
                      {new Date(service.expiration?.expire_date || '').toLocaleString('th-TH', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {service.expiration?.countdown.days}
                      </div>
                      <div className="text-xs text-gray-500">วัน</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {service.expiration?.countdown.hours}
                      </div>
                      <div className="text-xs text-gray-500">ชั่วโมง</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {service.expiration?.countdown.minutes}
                      </div>
                      <div className="text-xs text-gray-500">นาที</div>
                    </div>
                  </div>

                  {(service.expiration?.days_left ?? 0) < 30 && !service.expiration?.is_expired && (
                    <div className="mt-4 text-sm text-yellow-600">
                      <i className="bi bi-exclamation-triangle mr-2"></i>
                      ใกล้หมดอายุ กรุณาต่ออายุเร็วๆ นี้
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 