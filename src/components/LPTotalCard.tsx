import { Card, Row, Col } from 'react-bootstrap'

interface Props {
  lp: {
    unlockedTwin: string
    unlockedTwinValue: string
    lockedTwin: string
    lockedTwinValue: string
    lpValue: string
  }
}

const LPTotalCard = ({ lp }: Props) => {
  return (
    <Card
      style={{
        backgroundColor: 'transparent',
        border: '0',
      }}
    >
      <Card.Body>
        <Row>
          <Col md={6}></Col>
          <Col md={2} className="d-flex align-items-center justify-content-end">
            <h5>Total</h5>
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center">
            <div>
              <div>
                {lp.unlockedTwin} <small className="text-muted">({lp.unlockedTwinValue})</small>
              </div>
              <div>
                {lp.lockedTwin} <small className="text-muted">({lp.lockedTwinValue})</small>
              </div>
            </div>
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center text-primary">
            {lp.lpValue}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default LPTotalCard
