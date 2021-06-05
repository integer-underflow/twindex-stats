import { Card, Row, Col } from 'react-bootstrap'
import LPCard from './LPCard'

const LPTable = () => {
  return (
    <Card
      className="p-4"
      style={{
        background: '#192230',
      }}
    >
      <Card.Body className="pt-0">
        <h4 className="mb-4 m-0">LP Holdings</h4>

        <Row className="mb-4 mx-1">
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            LP Tokens Name
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Balance
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Underlying Assets
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Pending TWIN
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Total Value
          </Col>
        </Row>

        <LPCard
          name="DOLLY-AMZN"
          balance={1.94}
          assets={{
            AMZN: 0.031,
            DOLLY: 123.25,
          }}
          reward={{
            locked: 0.18,
            available: 0.73,
          }}
          value={245.98}
        />

        <LPCard
          name="DOLLY-TSLA"
          balance={1.94}
          assets={{
            TSLA: 0.031,
            DOLLY: 123.25,
          }}
          reward={{
            locked: 0.18,
            available: 0.73,
          }}
          value={245.98}
        />
      </Card.Body>
    </Card>
  )
}

export default LPTable
