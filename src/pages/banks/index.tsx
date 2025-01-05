import { useState, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getBanksByDomain } from '@/services/bankApi';
import type { Bank } from '@/types/bank';
import BankCard from '@/components/BankList/BankCard';
import DomainSummary from '@/components/BankList/DomainSummary';
import BankSummary from '@/components/BankList/BankSummary';
import Loading from '@/components/Loading';

interface BankQueryResult {
  data?: Bank[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

const defaultDomains = ['https://service.ufostar1.net'];

export default function BanksPage() {
  const { data: domainList = [] } = useQuery({
    queryKey: ['domain-list'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  });

  const domains = useMemo(() => {
    return domainList.map((d: { url: string }) => d.url);
  }, [domainList]);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    apiType: 'all',
    statusWithdraw: 'all',
    domain: defaultDomains[0],
    bankType: 'all'
  });
  const domainQueries = useQueries({
    queries: domains.map((domain: string) => ({
      queryKey: ['banks', domain],
      queryFn: () => getBanksByDomain(domain),
      retry: 2,
      retryDelay: 1000,
      staleTime: 30000,
    }))
  }) as BankQueryResult[];

  const selectedDomainData = useMemo(() => {
    return domainQueries.find(query =>
      query.data && domains.indexOf(filters.domain) === domainQueries.indexOf(query)
    );
  }, [domainQueries, filters.domain]);

  const getAllBankTypes = (banks: Bank[]) => {
    const bankTypes = new Set(banks.map(bank => bank.bank_name));
    return Array.from(bankTypes);
  };

  const filteredBanks = useMemo(() => {
    if (!selectedDomainData?.data) return [];
    
    return selectedDomainData.data
      .filter(bank => {
        const matchSearch = !filters.search || 
          bank.bank_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          bank.account_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          bank.bank_number.includes(filters.search);
        
        const matchStatus = filters.status === 'all' || 
          (filters.status === 'active' ? bank.status === 1 : bank.status === 0);
        
        const matchApiType = filters.apiType === 'all' || 
          (filters.apiType === 'truewallet_app' 
            ? (bank.api_type === 1 && bank.bank_code === '10')
            : bank.api_type.toString() === filters.apiType);
        
        const matchStatusWithdraw = filters.statusWithdraw === 'all' || 
          (filters.statusWithdraw === 'can' ? bank.status_withdraw === 1 : bank.status_withdraw === 0);
        
        const matchBankType = filters.bankType === 'all' || bank.bank_name === filters.bankType;
        
        return matchSearch && matchStatus && matchApiType && matchStatusWithdraw && matchBankType;
      })
      .sort((a, b) => {
        if (a.status !== b.status) {
          return b.status - a.status;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [selectedDomainData?.data, filters]);

  const domainData = useMemo(() => {
    return domainQueries
      .filter(query => query.data)
      .map((query, index) => ({
        domain: domains[index],
        banks: query.data || []
      }));
  }, [domainQueries]);

  return (
    <div className="py-6">
      {domainQueries.some(query => query.isLoading) ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="กำลังโหลดข้อมูลธนาคาร..." />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DomainSummary domainData={domainData} />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* ช่องค้นหา */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-search mr-2"></i>
                  ค้นหา
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ค้นหาชื่อธนาคาร, ชื่อบัญชี..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* เลือก Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-globe mr-2"></i>
                  Domain
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.domain}
                  onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                >
                  {Array.isArray(domains) ? domains.map((domain) => (
                    <option 
                      key={domain} 
                      value={domain}
                    >
                      {domain.replace('https://', '').replace('http://', '')}
                    </option>
                  )) : (
                    <option value={defaultDomains[0]}>{defaultDomains[0]}</option>
                  )}
                </select>
              </div>

              {/* เพิ่มตัวกรองธนาคาร */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-bank mr-2"></i>
                  ธนาคาร
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.bankType}
                  onChange={(e) => setFilters(prev => ({ ...prev, bankType: e.target.value }))}
                >
                  <option value="all">ทั้งหมด</option>
                  {selectedDomainData?.data && getAllBankTypes(selectedDomainData.data).map((bankName) => (
                    <option key={bankName} value={bankName}>
                      {bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* สถานะการใช้งาน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-toggle2-on mr-2"></i>
                  สถานะ
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">เปิดใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </select>
              </div>

              {/* ประเภท API */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-code-slash mr-2"></i>
                  ประเภท API
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.apiType}
                  onChange={(e) => setFilters(prev => ({ ...prev, apiType: e.target.value }))}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="truewallet_app">Truewallet_app</option>
                  <option value="1">ดึงข้อมูลจาก App ธนาคาร</option>
                  <option value="4">ดึงข้อมูลจาก SMS</option>
                  <option value="5">ดึงข้อมูลจาก Webhook</option>
                  <option value="6">แนบสลิป</option>
                  <option value="7">TwVoucher</option>
                </select>
              </div>

              {/* สถานะการถอน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-wallet2 mr-2"></i>
                  สถานะการถอน
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.statusWithdraw}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusWithdraw: e.target.value }))}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="can">ถอนได้</option>
                  <option value="cannot">ถอนไม่ได้</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Summary - เพิ่มส่วนนี้ก่อนแสดง Bank Cards */}
          {filteredBanks.length > 0 && (
            <BankSummary banks={filteredBanks} />
          )}

          {/* Bank Cards */}
          {filteredBanks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanks.map((bank) => (
                <BankCard key={bank.id} bank={bank} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="bi bi-inbox text-gray-400 text-5xl mb-4"></i>
              <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
