import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loading from '@/components/Loading';
import DateRangePicker from '@/components/PerformanceReport/DateRangePicker';
import SummaryCards from '@/components/PerformanceReport/SummaryCards';
import PerformanceTable from '@/components/PerformanceReport/PerformanceTable';
import PerformanceChart from '@/components/PerformanceReport/PerformanceChart';
import AnalyticsCards from '@/components/PerformanceReport/AnalyticsCards';

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
    <div className="py-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="กำลังโหลดข้อมูล..." />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-4">รายงานผลประกอบการ</h1>

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(date) => date && setStartDate(date)}
              onEndDateChange={(date) => date && setEndDate(date)}
              onYesterday={handleYesterday}
              onToday={handleToday}
              onSearch={() => refetch()}
            />

            <SummaryCards {...summaryData} />
            
            <AnalyticsCards data={{ agents: agentData }} />

            <div className="mb-6">
              <PerformanceChart data={chartData} />
            </div>

            <PerformanceTable agents={agentData} />
          </div>
        </div>
      )}
    </div>
  );
} 