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
        boxShadow: 'none',
      }}
    >
      <Card.Body>
        <Row>
          <Col md={4}></Col>
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <h5>Total</h5>
          </Col>
          <Col md={3} className="d-flex align-items-center justify-content-center text-center">
            <div>
              <div>
                <i className="fa fa-unlock" /> {lp.unlockedTwin} <small className="text-muted">({lp.unlockedTwinValue})</small>
              </div>
              <div>
                <i className="fa fa-lock" /> {lp.lockedTwin} <small className="text-muted">({lp.lockedTwinValue})</small>
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
