import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loading from '@/components/Loading';
import DateRangePicker from '@/components/PerformanceReport/DateRangePicker';
import SummaryCards from '@/components/PerformanceReport/SummaryCards';
import PerformanceTable from '@/components/PerformanceReport/PerformanceTable';
import PerformanceChart from '@/components/PerformanceReport/PerformanceChart';
import AnalyticsCards from '@/components/PerformanceReport/AnalyticsCards';
import AdvancedAnalytics from '@/components/PerformanceReport/AdvancedAnalytics';
import TrendAnalysis from '@/components/PerformanceReport/TrendAnalysis';

interface WinLoseData {
  _id: {
    _id: string;
    name: string;
    nickname: string;
    username: string;
  };
  agentTotal: number;
  companyWl: number;
  memberTotal: number;
  betAmt: number;
  validAmt: number;
  winLoseTotal: number;
}

interface ReportResponse {
  footer: {
    data: Array<{
      agentTotal: number;
      companyWl: number;
      memberTotal: number;
      betAmt: number;
      validAmt: number;
    }>;
  };
  winlose: {
    data: Array<{
      data: WinLoseData[];
    }>;
  };
}

export default function PerformanceReportPage() {
  // ตั้งค่าวันที่เริ่มต้น: วันนี้ถึงพรุ่งนี้
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [accessToken, setAccessToken] = useState<string>('');

  // Query สำหรับดึงข้อมูลรายงาน
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['performance-report', startDate, endDate, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        // 1. Login เพื่อรับ token
        const loginResponse = await axios.post('https://walrus-app-5ugwj.ondigitalocean.app/login', {
          username: "df88a@ngxbot",
          password: "@Aa123456Aa"
        });
        
        const token = loginResponse.data.token;
        setAccessToken(token);
        
        // 2. ใช้ token เพื่อดึงข้อมูลรายงาน
        const reportResponse = await axios.post<ReportResponse>(
          'https://walrus-app-5ugwj.ondigitalocean.app/getwlagent',
          {
            token,
            startDate: startDate.toLocaleDateString('en-GB'),
            endDate: endDate.toLocaleDateString('en-GB')
          }
        );
        
        return reportResponse.data;
      }
      
      const reportResponse = await axios.post<ReportResponse>(
        'https://walrus-app-5ugwj.ondigitalocean.app/getwlagent',
        {
          token: accessToken,
          startDate: startDate.toLocaleDateString('en-GB'),
          endDate: endDate.toLocaleDateString('en-GB')
        }
      );
      
      return reportResponse.data;
    },
    enabled: false // ไม่ให้ query ทำงานอัตโนมัติ
  });

  // ฟังก์ชันสำหรับเลือกวันที่เมื่อวาน
  const handleYesterday = () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    setStartDate(yesterday);
    setEndDate(today);
  };

  // ฟังก์ชันสำหรับเลือกวันนี้
  const handleToday = () => {
    setStartDate(today);
    setEndDate(tomorrow);
  };

  const summaryData = reportData?.footer?.data?.[0] || {
    agentTotal: 0,
    companyWl: 0,
    memberTotal: 0,
    betAmt: 0,
    validAmt: 0
  };

  const agentData = reportData?.winlose?.data?.[0]?.data || [];

  // ข้อมูลสำหรับกราฟ
  const chartData = agentData.map(item => ({
    name: item._id.name,
    'กำไรเอเย่นต์': item.agentTotal,
    'ยอดนำส่ง Company': item.companyWl,
    'ยอดเล่นลูกค้า': item.memberTotal
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="กำลังโหลดข้อมูล..." />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              รายงานผลประกอบการ
            </h1>
            <p className="text-gray-600 mt-2">ข้อมูลและการวิเคราะห์ผลประกอบการทั้งหมด</p>
          </div>

          {/* Date Picker Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-gray-100">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(date) => date && setStartDate(date)}
              onEndDateChange={(date) => date && setEndDate(date)}
              onYesterday={handleYesterday}
              onToday={handleToday}
              onSearch={() => refetch()}
            />
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <SummaryCards {...summaryData} />
            <AdvancedAnalytics data={{ agents: agentData }} />
            <TrendAnalysis data={{ agents: agentData }} />
            <AnalyticsCards data={{ agents: agentData }} />
            
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-gray-100">
              <PerformanceChart data={chartData} />
            </div>

            <PerformanceTable 
              agents={agentData} 
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      )}
    </div>
  );
} 