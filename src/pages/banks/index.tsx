import { useState, useMemo } from 'react';
import { useQueries } from 'react-query';
import { getBanksByDomain } from '@/services/bankApi';
import { Container, Form, Spinner, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import type { Bank } from '@/types/bank';
import BankCard from '@/components/BankList/BankCard';

interface BankQueryResult {
  data?: Bank[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

const domains = [
  'https://service.allcasino1.com',
  'https://service.ufostar1.net'
];

export default function BanksPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>(domains[0]);

  // ดึงข้อมูลจากทุก domain
  const domainQueries = useQueries(
    domains.map(domain => ({
      queryKey: ['banks', domain],
      queryFn: () => getBanksByDomain(domain),
      retry: 2,
      retryDelay: 1000,
      staleTime: 30000,
    }))
  ) as BankQueryResult[];

  // ดึงข้อมูลของ domain ที่เลือก
  const selectedDomainData = useMemo(() => {
    return domainQueries.find(query => 
      query.data && domains.indexOf(selectedDomain) === domainQueries.indexOf(query)
    );
  }, [domainQueries, selectedDomain]);

  // คำนวณสรุปรวมทุก Domain
  const allDomainsSummary = useMemo(() => {
    const summary = {
      totalBanks: 0,
      activeBanks: 0,
      inactiveBanks: 0,
      totalBalance: 0,
      withdrawableBanks: 0,
      nonWithdrawableBanks: 0,
    };

    domainQueries.forEach(query => {
      const banks = query.data || [];
      summary.totalBanks += banks.length;
      summary.activeBanks += banks.filter(b => b.status === 1).length;
      summary.inactiveBanks += banks.filter(b => b.status === 0).length;
      summary.totalBalance += banks.reduce((sum, b) => sum + (b.balance || 0), 0);
      summary.withdrawableBanks += banks.filter(b => b.status_withdraw === 1).length;
      summary.nonWithdrawableBanks += banks.filter(b => b.status_withdraw === 0).length;
    });

    return summary;
  }, [domainQueries]);

  // คำนวณสรุปแยกตาม Domain
  const domainSummaries = useMemo(() => {
    return domains.map((domain, index) => {
      const query = domainQueries[index];
      const banks = query?.data || [];
      
      return {
        domain,
        isLoading: query?.isLoading,
        error: query?.error,
        totalBanks: banks.length,
        activeBanks: banks.filter(b => b.status === 1).length,
        inactiveBanks: banks.filter(b => b.status === 0).length,
        totalBalance: banks.reduce((sum, b) => sum + (b.balance || 0), 0),
        withdrawableBanks: banks.filter(b => b.status_withdraw === 1).length,
        nonWithdrawableBanks: banks.filter(b => b.status_withdraw === 0).length,
      };
    });
  }, [domainQueries]);

  return (
    <div>
      <Container>
        {/* สรุปภาพรวมทั้งหมด */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">สรุปภาพรวมทั้งหมด</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <h6 className="text-muted">บัญชีทั้งหมด</h6>
                  <h3>{allDomainsSummary.totalBanks}</h3>
                  <div>
                    <Badge bg="success" className="me-2">เปิดใช้งาน {allDomainsSummary.activeBanks}</Badge>
                    <Badge bg="danger">ปิดใช้งาน {allDomainsSummary.inactiveBanks}</Badge>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <h6 className="text-muted">ยอดเงินรวม</h6>
                  <h3>฿{allDomainsSummary.totalBalance.toLocaleString()}</h3>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <h6 className="text-muted">สถานะการถอน</h6>
                  <div>
                    <Badge bg="primary" className="me-2">ถอนได้ {allDomainsSummary.withdrawableBanks}</Badge>
                    <Badge bg="secondary">ถอนไม่ได้ {allDomainsSummary.nonWithdrawableBanks}</Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* สรุปแยกตาม Domain */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">สรุปข้อมูลแยกตาม Domain</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {domainSummaries.map((summary) => (
                <Col key={summary.domain} md={6} className="mb-4">
                  <Card>
                    <Card.Body>
                      <h6 className="mb-3">{summary.domain}</h6>
                      {summary.isLoading ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                        </div>
                      ) : summary.error ? (
                        <Alert variant="danger" className="mb-0">ไม่สามารถโหลดข้อมูลได้</Alert>
                      ) : (
                        <>
                          <div className="d-flex justify-content-between mb-2">
                            <span>บัญชีทั้งหมด</span>
                            <span>{summary.totalBanks}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>เปิดใช้งาน</span>
                            <Badge bg="success">{summary.activeBanks}</Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>ปิดใช้งาน</span>
                            <Badge bg="danger">{summary.inactiveBanks}</Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>ยอดเงินรวม</span>
                            <span>฿{summary.totalBalance.toLocaleString()}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>สถานะการถอน</span>
                            <div>
                              <Badge bg="primary" className="me-1">{summary.withdrawableBanks}</Badge>
                              <Badge bg="secondary">{summary.nonWithdrawableBanks}</Badge>
                            </div>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* รายการบัญชีธนาคาร */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">รายการบัญชีธนาคาร</h5>
            <Form.Select 
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{ width: 'auto' }}
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </Form.Select>
          </Card.Header>
          <Card.Body>
            {selectedDomainData?.isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <div className="mt-2">กำลังโหลดข้อมูล...</div>
              </div>
            ) : selectedDomainData?.error ? (
              <Alert variant="danger">
                <div className="text-center">ไม่สามารถโหลดข้อมูลได้</div>
              </Alert>
            ) : selectedDomainData?.data?.length ? (
              <Row>
                {selectedDomainData.data.map((bank: Bank) => (
                  <Col key={bank.id} lg={4} md={6} className="mb-4">
                    <BankCard bank={bank} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-4 text-muted">
                ไม่พบข้อมูลทัญชีธนาคาร
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
