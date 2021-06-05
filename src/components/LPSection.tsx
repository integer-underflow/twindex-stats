import { useEffect, useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { getLPs, LPPrice } from '../modules/LiquidityPool'
import { getAddressInQueryString } from '../modules/Utils'
import LPCard from './LPCard'

const LPSection = () => {
  const [LPs, setLPs] = useState<LPPrice[]>([])

  useEffect(() => {
    ;(async () => {
      const address = getAddressInQueryString()
      if (address) {
        const lps = await getLPs(address)
        setLPs(lps)
      }
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
        <h4 className="mb-4 m-0">LP Holdings</h4>

        <Row className="mb-4 mx-1">
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            LP Tokens Name
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Balance
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Underlying Assets
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Pending TWIN
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Total Value
          </Col>
        </Row>

        {LPs.map((lp, index) => {
          return <LPCard key={index} lp={lp} />
        })}
      </Card.Body>
    </Card>
  )
}

export default LPSection
