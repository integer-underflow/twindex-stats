import { Card, Row, Col } from 'react-bootstrap'
import MintCard from './MintCard'

const MintTable = () => {
  return (
    <Card
      className="p-4"
      style={{
        background: '#192230',
      }}
    >
      <Card.Body className="pt-0">
        <h4 className="mb-4 m-0">Mint Positions</h4>

        <Row className="mb-4 mx-1">
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            Asset
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            Collateral
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            Health
          </Col>
        </Row>

        <MintCard
          asset={{
            name: 'AMZN',
            value: 1,
          }}
          collateral={{
            name: 'DOLLY',
            value: 125,
          }}
          health={50}
        />

        <MintCard
          asset={{
            name: 'TSLA',
            value: 1,
          }}
          collateral={{
            name: 'DOLLY',
            value: 233,
          }}
          health={80}
        />
      </Card.Body>
    </Card>
  )
}

export default MintTable
