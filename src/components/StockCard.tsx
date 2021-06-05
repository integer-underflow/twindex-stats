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
        <span className="d-none d-lg-block">
          <Row>
            <Col className="text-center" style={{ fontWeight: 300 }} lg={3}>
              <span className="text-primary">{price.token}</span>
            </Col>
            <Col className="text-center" style={{ fontWeight: 300 }} lg={3}>
              {price.stockPrice}
            </Col>
            <Col className="text-center" style={{ fontWeight: 300 }} lg={3}>
              {price.oraclePrice}
            </Col>
            <Col className="text-center" style={{ fontWeight: 300 }} lg={3}>
              {price.diff}
            </Col>
          </Row>
        </span>
        <span className="d-md-block d-lg-none">
          <Row>
            <Col sm={5} className="d-flex align-items-center justify-content-center">
              <h3 className="text-primary m-0">{price.token}</h3>
            </Col>
            <Col sm={7} className="d-flex align-items-center justify-content-center">
              <Row>
                <Col xs={6} className="text-right">
                  Twindex
                </Col>
                <Col xs={6} style={{ fontWeight: 200 }}>
                  {price.stockPrice}
                </Col>
                <Col xs={6} className="text-right">
                  Oracle
                </Col>
                <Col xs={6} style={{ fontWeight: 200 }}>
                  {price.oraclePrice}
                </Col>
                <Col xs={6} className="text-right">
                  Difference
                </Col>
                <Col xs={6} style={{ fontWeight: 200 }}>
                  {price.diff}
                </Col>
              </Row>
            </Col>
          </Row>
        </span>
      </Card.Body>
    </Card>
  )
}

export default StockCard
