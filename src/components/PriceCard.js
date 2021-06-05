import { Card, Row, Col } from 'react-bootstrap'

const PriceCard = ({ symbol, price }) => {
  return (
    <Card>
      <Card.Body>
        <Row>
          <Col md="5">
            <img src={`https://via.placeholder.com/300?text=${symbol}`} alt="Placeholder" className="img-fluid" />
          </Col>
          <Col md="7" className="d-flex align-items-center">
            <div>
              <h5 className="m-0 text-muted">{symbol}</h5>
              <h2 className="m-0">${price}</h2>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default PriceCard
