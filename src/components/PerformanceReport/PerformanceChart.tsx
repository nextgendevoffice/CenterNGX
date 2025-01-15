import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
  name: string;
  'กำไรเอเย่นต์': number;
  'ยอดนำส่ง Company': number;
  'ยอดเล่นลูกค้า': number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">กราฟแสดงผลประกอบการรายเอเย่นต์</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="กำไรเอเย่นต์" fill="#22c55e" />
            <Bar dataKey="ยอดนำส่ง Company" fill="#3b82f6" />
            <Bar dataKey="ยอดเล่นลูกค้า" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}