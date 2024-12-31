import { Bank } from '@/types/bank';

interface DomainSummaryProps {
  domainData: {
    domain: string;
    banks: Bank[];
  }[];
}

export default function DomainSummary({ domainData }: DomainSummaryProps) {
  const calculateTotalBalance = (banks: Bank[]) => {
    return banks.reduce((sum, bank) => sum + bank.balance, 0);
  };

  const totalSummary = domainData.reduce((summary, { banks }) => ({
    totalBanks: summary.totalBanks + banks.length,
    activeBanks: summary.activeBanks + banks.filter(b => b.status === 1).length,
    inactiveBanks: summary.inactiveBanks + banks.filter(b => b.status === 0).length,
    withdrawableBanks: summary.withdrawableBanks + banks.filter(b => b.status_withdraw === 1).length,
    totalBalance: summary.totalBalance + calculateTotalBalance(banks)
  }), {
    totalBanks: 0,
    activeBanks: 0,
    inactiveBanks: 0,
    withdrawableBanks: 0,
    totalBalance: 0
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">สรุปรวมทุก Domain</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-sm text-blue-600">บัญชีทั้งหมด</div>
            <div className="text-xl font-semibold">{totalSummary.totalBanks}</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">เปิดใช้งาน</div>
            <div className="text-xl font-semibold text-green-600">{totalSummary.activeBanks}</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">ปิดใช้งาน</div>
            <div className="text-xl font-semibold text-red-600">{totalSummary.inactiveBanks}</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">ถอนได้</div>
            <div className="text-xl font-semibold text-blue-600">{totalSummary.withdrawableBanks}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 