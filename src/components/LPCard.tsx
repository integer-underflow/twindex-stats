import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { LPPrice } from '../modules/LiquidityPool'

interface Props {
  lp: LPPrice
}

const LPCard = ({ lp }: Props) => {
  const poolImage = useMemo(() => {
    return `/twindex-stats/image/pool/${lp.token1Symbol}-${lp.token0Symbol}.svg`
  }, [lp.token0Symbol, lp.token1Symbol])

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
          <Col md={12} lg={4}>
            <div className="d-flex align-items-center justify-content-lg-start justify-content-center ml-0 ml-lg-4">
              <img src={poolImage} alt="" />
              <div
                className="d-flex align-items-center align-items-lg-start flex-column ml-3"
                style={{
                  fontWeight: 300,
                }}
              >
                {lp.token1Symbol}-{lp.token0Symbol} LP <br />
                <small className="text-primary">
                  {lp.lpAmount}&nbsp;<span style={{ fontWeight: 200 }}>LP</span>
                </small>
              </div>
            </div>
            <hr className="d-lg-none d-block" />
          </Col>
          <Col md={12} lg={3} className="d-flex align-items-center justify-content-center flex-column">
            <span className="d-lg-none d-block mb-2" style={{ fontWeight: 200 }}>
              Underlying Assets
            </span>
            <span>
              {lp.token1Amount} <small style={{ fontWeight: 200 }}>{lp.token1Symbol}</small>
            </span>
            <span>
              {lp.token0Amount} <small style={{ fontWeight: 200 }}>{lp.token0Symbol}</small>
            </span>
          </Col>
          <Col md={12} lg={0} className="d-lg-none d-block">
            <hr />
          </Col>
          <Col md={12} lg={3} className="d-flex align-items-center justify-content-center text-center">
            <div>
              <span className="d-lg-none d-block mb-2" style={{ fontWeight: 200 }}>
                Pending TWIN
              </span>
              <div>
                <i className="fa fa-unlock" /> {lp.unlockedTwin} <small className="text-muted">({lp.unlockedTwinValue})</small>
              </div>
              <div>
                <i className="fa fa-lock" /> {lp.lockedTwin} <small className="text-muted">({lp.lockedTwinValue})</small>
              </div>
            </div>
          </Col>
          <Col md={12} lg={0} className="d-lg-none d-block">
            <hr />
          </Col>
          <Col md={12} lg={2} className="d-flex align-items-center justify-content-center text-primary text-center">
            <div>
              <span className="d-lg-none d-block mb-2" style={{ fontWeight: 200 }}>
                Total Value
              </span>
              {lp.lpValue}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default LPCard
