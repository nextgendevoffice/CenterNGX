import { Bank } from '@/types/bank';
import { Card, Badge } from 'react-bootstrap';

interface BankCardProps {
  bank: Bank;
}

export default function BankCard({ bank }: BankCardProps) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">{bank.bank_name}</h5>
            <div className="text-muted small">{bank.bank_number}</div>
          </div>
          <Badge bg={bank.status === 1 ? 'success' : 'danger'}>
            {bank.status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </Badge>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">ชื่อบัญชี</span>
            <span>{bank.account_name}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted">ยอดเงิน</span>
            <span className="fw-bold">฿{bank.balance.toLocaleString()}</span>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <Badge bg={bank.status_withdraw === 1 ? 'primary' : 'secondary'}>
            {bank.status_withdraw === 1 ? 'ถอนได้' : 'ถอนไม่ได้'}
          </Badge>
          <small className="text-muted">
            อัพเดทล่าสุด: {new Date(bank.updated_at).toLocaleDateString('th-TH')}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
