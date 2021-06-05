import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'

interface Props {
  symbol: string
  price: string
}

const PriceCard = ({ symbol, price }: Props) => {
  const symbolIcon = useMemo(() => {
    switch (symbol) {
      case 'TWIN':
        return 'image/twin.svg'
      case 'DOP':
        return 'image/dop.svg'
    }
  }, [symbol])

  const priceDisplay = useMemo(() => {
    if (price === '') return '$---'
    return price
  }, [price])

  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center justify-content-center">
        <Row>
          <Col md="12" lg="5" className="text-center d-flex align-items-center justify-content-center">
            <img
              src={symbolIcon}
              alt="Token Icon"
              className="img-fluid"
              style={{
                height: '3em',
              }}
            />
          </Col>
          <Col md="12" lg="7">
            <div className="d-none d-lg-flex align-items-center">
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
                <h2 className="m-0">{priceDisplay}</h2>
              </div>
            </div>

            <div className="d-lg-none d-md-flex align-items-center justify-content-center text-center">
              <div>
                <h6
                  className="m-0 mt-3"
                  style={{
                    fontWeight: 300,
                    opacity: 0.5,
                  }}
                >
                  {symbol}
                </h6>
                <h2 className="m-0">{priceDisplay}</h2>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default PriceCard
