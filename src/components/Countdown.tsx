import { Card, Col, Row } from 'react-bootstrap'

const Countdown = () => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Row className="h-100 d-flex align-items-center">
          <Col md={4} className="text-center">
            0.00 ($X.XX) <br />
            <small className="text-muted">TWIN Locked</small>
          </Col>
          <Col md={8} className="text-center">
            25 DAYS 09 HR 55 MIN 13 SEC <br />
            <small className="text-muted">until rewards unlock</small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default Countdown
