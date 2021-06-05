import { Card, Row, Col } from 'react-bootstrap'
import StockCard from './StockCard'

const StockTable = () => {
  return (
    <Card
      className="p-4"
      style={{
        background: '#192230',
      }}
    >
      <Card.Body className="pt-0">
        <h4 className="mb-4 m-0">Stock Price</h4>

        <Row className="mb-4 mx-1">
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Symbol
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Twindex
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Oracle
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Diff
          </Col>
        </Row>

        <StockCard
          symbol="AMZN"
          price={{
            twindex: 4000,
            oracle: 3000,
          }}
        />

        <StockCard
          symbol="TSLA"
          price={{
            twindex: 756.88,
            oracle: 599.29,
          }}
        />
      </Card.Body>
    </Card>
  )
}

export default StockTable
