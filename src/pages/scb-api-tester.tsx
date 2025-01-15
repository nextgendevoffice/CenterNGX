import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

interface LoginResponse {
  deviceId: string;
  'Api-Refresh': string;
  'Api-Auth': string;
  dsig: boolean;
  dtag: boolean;
  SetCookie: string;
  last_date: string;
  last_time: string;
  cached: boolean;
}

interface BalanceResponse {
  status: {
    code: number;
    header: string;
    description: string;
  };
  totalAvailableBalance: number;
  depositList: any[];
  // เพิ่ม interface ตาม response ที่ได้
}

interface TransactionResponse {
  status: {
    code: number;
    header: string;
    description: string;
  };
  data: {
    accountNo: string;
    txnList: any[];
    pageSize: number;
    nextPageNumber: null;
    endOfListFlag: string;
  };
}

interface TransferResponse {
  status: {
    code: number;
    header: string;
    description: string;
  };
  data: {
    transactionId: string;
    transactionDateTime: string;
    remainingBalance: number;
    status: null;
    orgRquid: null;
    additionalMetaData: {
      paymentInfo: Array<{
        type: string;
        title: string;
        header: null;
        description: null;
        imageURL: null;
        QRstring: string;
      }>;
    };
    isForcePost: string;
    remainingPoint: null;
  };
}

export default function ScbApiTesterPage() {
  const [deviceId, setDeviceId] = useState('B86B8361-5D30-4422-BF73-E62800D5B480');
  const [pin, setPin] = useState('060994');
  const [phone, setPhone] = useState('0806522180');
  const [accountNo, setAccountNo] = useState('5474042202');
  const [accountFrom, setAccountFrom] = useState('5474042202');
  const [accountTo, setAccountTo] = useState('6614954288');
  const [bankCode, setBankCode] = useState('006');
  const [amount, setAmount] = useState('1');
  const [activeTab, setActiveTab] = useState<'login' | 'balance' | 'transactions' | 'transfer'>('login');
  const [response, setResponse] = useState<any>(null);

  // Mutation สำหรับ Login
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<LoginResponse>('https://trialnextgen.lnws.io/BmV4dGdlbg/login', {
        deviceId,
        pin,
        phone
      });
      return response.data;
    }
  });

  // Mutation สำหรับเช็คยอด
  const balanceMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<BalanceResponse>('https://trialnextgen.lnws.io/BmV4dGdlbg/balance', {
        deviceId,
        pin,
        phone,
        accountNo
      });
      return response.data;
    }
  });

  // Mutation สำหรับดูรายการ
  const transactionsMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<TransactionResponse>('https://trialnextgen.lnws.io/BmV4dGdlbg/transactions', {
        deviceId,
        pin,
        phone,
        accountNo
      });
      return response.data;
    }
  });

  // เพิ่ม Mutation สำหรับโอนเงิน
  const transferMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<TransferResponse>('https://trialnextgen.lnws.io/BmV4dGdlbg/transferCreate', {
        deviceId,
        pin,
        phone,
        accountFrom,
        accountTo,
        bank: bankCode,
        amount
      });
      return response.data;
    }
  });

  const handleSubmit = async () => {
    try {
      let result;
      switch (activeTab) {
        case 'login':
          result = await loginMutation.mutateAsync();
          break;
        case 'balance':
          result = await balanceMutation.mutateAsync();
          break;
        case 'transactions':
          result = await transactionsMutation.mutateAsync();
          break;
        case 'transfer':
          result = await transferMutation.mutateAsync();
          break;
      }
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">SCB API Tester</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            {['login', 'balance', 'transactions', 'transfer'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
            </div>

            {/* Transfer-specific Fields */}
            {activeTab === 'transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <input
                    type="text"
                    value={accountFrom}
                    onChange={(e) => setAccountFrom(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                  <input
                    type="text"
                    value={accountTo}
                    onChange={(e) => setAccountTo(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                  >
                    <option value="002">ธนาคารกรุงเทพ</option>
                    <option value="004">ธนาคารกสิกรไทย</option>
                    <option value="006">ธนาคารกรุงไทย</option>
                    <option value="011">ธนาคารทหารไทยธนชาต</option>
                    <option value="014">ธนาคารไทยพาณิชย์</option>
                    <option value="025">ธนาคารกรุงศรีอยุธยา</option>
                    <option value="069">ธนาคารเกียรตินาคินภัทร</option>
                    <option value="022">ธนาคารซีไอเอ็มบีไทย</option>
                    <option value="067">ธนาคารทิสโก้</option>
                    <option value="024">ธนาคารยูโอบี</option>
                    <option value="071">ธนาคารไทยเครดิต</option>
                    <option value="073">ธนาคารแลนด์ แอนด์ เฮ้าส์</option>
                    <option value="070">ธนาคารไอซีบีซี (ไทย)</option>
                    <option value="098">ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย</option>
                    <option value="034">ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร</option>
                    <option value="035">ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย</option>
                    <option value="030">ธนาคารออมสิน</option>
                    <option value="033">ธนาคารอาคารสงเคราะห์</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border-gray-300"
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}

            {/* Balance/Transactions-specific Fields */}
            {(activeTab === 'balance' || activeTab === 'transactions') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account No</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full rounded-md border-gray-300"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loginMutation.isPending || balanceMutation.isPending || transactionsMutation.isPending || transferMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {(loginMutation.isPending || balanceMutation.isPending || transactionsMutation.isPending || transferMutation.isPending)
              ? 'กำลังดำเนินการ...'
              : 'ทดสอบ API'}
          </button>
        </div>

        {/* Response Section */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">ผลลัพธ์</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">
                {JSON.stringify(response, null, 2)}
              </code>
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
} 