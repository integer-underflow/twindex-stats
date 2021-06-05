import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'

interface Props {
  symbol: string
  price: {
    twindex: number
    oracle: number
  }
}

const StockCard = ({ symbol, price }: Props) => {
  const priceDiff = useMemo(() => {
    return Math.floor(((price.twindex - price.oracle) / price.oracle) * 100)
  }, [price.twindex, price.oracle])

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
            {symbol}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            ${price.twindex}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            ${price.oracle}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            {priceDiff}%
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default StockCard
