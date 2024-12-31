import React from 'react';
import { Bank } from '@/types/bank';

interface BankCardProps {
  bank: Bank;
}

const getApiTypeLabel = (apiType: number, bankCode: string): string => {
  if (apiType === 1 && bankCode === '10') {
    return 'Truewallet_app';
  }

  switch (apiType) {
    case 1: return 'ดึงข้อมูลจาก App ธนาคาร';
    case 4: return 'ดึงข้อมูลจาก SMS';
    case 5: return 'ดึงข้อมูลจาก Webhook (NextPayz)';
    case 6: return 'แนบสลิป';
    case 7: return 'TwVoucher (TrueWallet)';
    default: return 'ไม่ระบุ';
  }
};

const getApiTypeStyle = (apiType: number): string => {
  switch (apiType) {
    case 1: return 'bg-blue-100 text-blue-800';
    case 4: return 'bg-yellow-100 text-yellow-800';
    case 5: return 'bg-purple-100 text-purple-800';
    case 6: return 'bg-gray-100 text-gray-800';
    case 7: return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const BankCard: React.FC<BankCardProps> = ({ bank }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h5 className="text-lg font-semibold text-gray-900">{bank.bank_name}</h5>
          <div className="text-sm text-gray-500">{bank.bank_number}</div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          bank.status === 1 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {bank.status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">ชื่อบัญชี</span>
          <span className="text-sm font-medium">{bank.account_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">ยอดเงิน</span>
          <span className="text-sm font-semibold">฿{bank.balance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">ประเภทการดึงข้อมูล</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApiTypeStyle(bank.api_type)}`}>
            {getApiTypeLabel(bank.api_type, bank.bank_code)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          bank.status_withdraw === 1 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {bank.status_withdraw === 1 ? 'ถอนได้' : 'ถอนไม่ได้'}
        </span>
        <span className="text-xs text-gray-500">
          อัพเดทล่าสุด: {new Date(bank.updated_at).toLocaleDateString('th-TH')}
        </span>
      </div>
    </div>
  );
};

export default BankCard;
