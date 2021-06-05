import { Card, Row, Col } from 'react-bootstrap'
import { StockPrice } from '../modules/Stock'

interface Props {
  price: StockPrice
}

const StockCard = ({ price }: Props) => {
  // const priceDiff = useMemo(() => {
  //   return Math.floor(((price.twindex - price.oracle) / price.oracle) * 100)
  // }, [price.twindex, price.oracle])

  return (
    <Card
      style={{
        border: '1px solid #374151',
        borderRadius: 20,
      }}
      className="mb-2"
    >
      <Card.Body className="py-2">
        <Row>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            <span className="text-primary">{price.token}</span>
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            {price.stockPrice}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            {price.oraclePrice}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            {price.diff}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default StockCard
