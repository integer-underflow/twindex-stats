import React, { useEffect, useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { loadStocksPrice, StockPrice } from '../modules/Stock'
import StockCard from './StockCard'

const StockTable = () => {
  const [prices, setPrices] = useState<StockPrice[]>([])

  useEffect(() => {
    ;(async () => {
      setPrices(await loadStocksPrice())
    })()
  }, [])

  return (
    <Card
      className="p-4"
      style={{
        background: '#192230',
      }}
    >
      <Card.Body className="pt-0">
        <h4 className="mb-4 m-0">Stock Price</h4>

        <Row className="mb-3 mx-1 d-none d-lg-flex">
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
            Difference
          </Col>
        </Row>

        {prices.map((price) => {
          return <StockCard key={price.token} price={price} />
        })}
      </Card.Body>
    </Card>
  )
}

export default StockTable
