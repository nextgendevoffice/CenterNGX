import { Bank } from '@/types/bank';
import BankCard from './BankCard';
import { Row, Col } from 'react-bootstrap';

interface BankListProps {
  banks: Bank[];
}

export default function BankList({ banks }: BankListProps) {
  return (
    <Row>
      {banks.map((bank) => (
        <Col key={bank.id} lg={4} md={6} className="mb-4">
          <BankCard bank={bank} />
        </Col>
      ))}
    </Row>
  );
}
