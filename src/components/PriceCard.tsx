import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'

interface Props {
  symbol: string
  price: string
}

const PriceCard = ({ symbol, price }: Props) => {
  const symbolIcon = useMemo(() => {
    switch (symbol) {
      case 'TWINDEX':
        return 'image/twin.svg'
      case 'DOP':
        return 'image/dop.svg'
    }
  }, [symbol])

  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center justify-content-center">
        <Row>
          <Col md="5" className="text-center d-flex align-items-center justify-content-center">
            <img src={symbolIcon} alt="Placeholder" className="img-fluid h-75" />
          </Col>
          <Col md="7" className="d-flex align-items-center">
            <div>
              <h6
                className="m-0"
                style={{
                  fontWeight: 300,
                  opacity: 0.5,
                }}
              >
                {symbol}
              </h6>
              <h2 className="m-0">{price}</h2>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default PriceCard
