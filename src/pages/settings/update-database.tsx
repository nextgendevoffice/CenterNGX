import { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Domain {
  id: number;
  url: string;
  name: string;
}

interface UpdateResponse {
  message: string;
  successful: Array<{
    query: string;
    status: string;
  }>;
  failed: Array<{
    query: string;
    status: string;
    error: string;
  }>;
}

export default function UpdateDatabase() {
  const [results, setResults] = useState<Record<string, UpdateResponse>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  // ดึงข้อมูล domains จาก API
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  const updateDatabase = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        domains.map(async (domainObj: Domain) => {
          try {
            const response = await axios.get(`${domainObj.url}/api/common/column/add_column`, {
              headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate', 
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1'
              }
            });
            setResults(prev => ({
              ...prev,
              [domainObj.url]: response.data
            }));
            toast.success(`อัพเดท ${domainObj.name || domainObj.url} สำเร็จ`);
          } catch (error: any) {
            setResults(prev => ({
              ...prev,
              [domainObj.url]: {
                message: 'เกิดข้อผิดพลาด',
                successful: [],
                failed: [{
                  query: 'Connection failed',
                  status: 'error',
                  error: error?.message || 'Unknown error'
                }]
              }
            }));
            toast.error(`เกิดข้อผิดพลาดที่ ${domainObj.name || domainObj.url}`);
          }
        })
      );
    } catch (error) {
      console.error('Error updating database:', error);
      toast.error('เกิดข้อผิดพลาดในการอัพเดท');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">อัพเดทฐานข้อมูล</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">รายการ Domain ทั้งหมด ({domains.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((domain: Domain) => (
            <div key={domain.id} className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{domain.name}</div>
              <div className="text-sm text-gray-600">{domain.url}</div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={updateDatabase}
        disabled={isLoading || domains.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'กำลังอัพเดท...' : 'อัพเดทฐานข้อมูล'}
      </button>

      {/* Results Section */}
      <div className="mt-6 space-y-4">
        {Object.entries(results).map(([domain, result]) => (
          <div key={domain} className="bg-white rounded-lg shadow-sm border">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedDomain(expandedDomain === domain ? null : domain)}
            >
              <div>
                <h3 className="font-medium">{domain}</h3>
                <div className="text-sm mt-1">
                  <span className="text-green-600 mr-4">
                    สำเร็จ: {result.successful?.length || 0}
                  </span>
                  <span className="text-red-600">
                    ไม่สำเร็จ: {result.failed?.length || 0}
                  </span>
                </div>
              </div>
              <i className={`bi bi-chevron-${expandedDomain === domain ? 'up' : 'down'} text-gray-500`}></i>
            </div>

            {expandedDomain === domain && (
              <div className="border-t p-4">
                {/* Successful Queries */}
                {result.successful?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">คำสั่งที่สำเร็จ</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.successful.map((item, index) => (
                        <div key={index} className="text-sm text-green-600 flex items-start">
                          <i className="bi bi-check-circle mr-2 mt-1"></i>
                          <span className="text-xs break-all">{item.query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Queries */}
                {result.failed?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">คำสั่งที่ไม่สำเร็จ</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.failed.map((item, index) => (
                        <div key={index} className="text-sm text-red-600">
                          <div className="flex items-start">
                            <i className="bi bi-x-circle mr-2 mt-1"></i>
                            <span className="text-xs break-all">{item.query}</span>
                          </div>
                          <div className="text-xs text-red-500 mt-1 ml-6">
                            Error: {item.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
