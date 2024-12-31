import { Bank } from '@/types/bank';

interface BankSummaryProps {
  banks: Bank[];
}

export default function BankSummary({ banks }: BankSummaryProps) {
  // จัดกลุ่มข้อมูลตามธนาคาร
  const bankSummary = banks.reduce((acc, bank) => {
    const bankName = bank.bank_name;
    if (!acc[bankName]) {
      acc[bankName] = {
        total: 0,
        active: 0,
        inactive: 0
      };
    }
    acc[bankName].total += 1;
    acc[bankName].active += bank.status === 1 ? 1 : 0;
    acc[bankName].inactive += bank.status === 0 ? 1 : 0;
    return acc;
  }, {} as Record<string, { total: number; active: number; inactive: number }>);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">สรุปข้อมูลธนาคาร</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(bankSummary).map(([bankName, stats]) => (
          <div key={bankName} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">{bankName}</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">บัญชีทั้งหมด</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">เปิดใช้งาน</span>
                <span className="text-green-600 font-medium">{stats.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ปิดใช้งาน</span>
                <span className="text-red-600 font-medium">{stats.inactive}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 