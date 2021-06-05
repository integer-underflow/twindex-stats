import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'

interface Props {
  name: string
  balance: number
  assets: {
    [key: string]: number
  }
  reward: {
    locked: number
    available: number
  }
  value: number
}

const LPCard = ({ name, balance, assets, reward, value }: Props) => {
  const poolImage = useMemo(() => {
    switch (name) {
      case 'DOLLY-AMZN':
        return '/image/pool/DOLLY-AMZN.svg'
      case 'DOLLY-TSLA':
        return '/image/pool/DOLLY-TSLA.svg'
    }
  }, [name])

  return (
    <Card
      style={{
        border: '1px solid #374151',
        borderRadius: 20,
      }}
      className="mb-4"
    >
      <Card.Body>
        <Row>
          <Col md={4}>
            <Row>
              <Col md={4}>
                <img src={poolImage} alt="" />
              </Col>
              <Col
                className="d-flex align-items-center"
                style={{
                  fontWeight: 300,
                }}
              >
                {name} LP
              </Col>
            </Row>
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center">
            {balance}&nbsp;<span style={{ fontWeight: 200 }}>LP</span>
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center flex-column">
            {Object.entries(assets).map(([key, value]) => {
              return (
                <span>
                  {value} <span style={{ fontWeight: 200 }}>{key}</span>
                </span>
              )
            })}
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center">
            <div>
              <div>
                {reward.available} <small className="text-muted">($X.XX)</small>
              </div>
              <div>
                {reward.locked} <small className="text-muted">($X.XX)</small>
              </div>
            </div>
          </Col>
          <Col md={2} className="d-flex align-items-center justify-content-center text-primary">
            ${value}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default LPCard
