import { useEffect, useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import MintCard from './MintCard'
import { getMintPositions, MintPosition } from '../modules/Loan'
import { getAddressInQueryString } from '../modules/Utils'

const MintSection = () => {
  const [positions, setPositions] = useState<MintPosition[]>([])

  useEffect(() => {
    ;(async () => {
      const address = getAddressInQueryString()
      if (address) setPositions(await getMintPositions(address))
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
        <h4 className="mb-4 m-0">Mint Positions</h4>

        <Row className="mb-3 mx-1">
          <Col className="text-center" style={{ fontWeight: 300 }} md={5}>
            Asset <br />
            Collateral
          </Col>
          <Col className="d-flex align-items-center justify-content-center" style={{ fontWeight: 300 }} md={7}>
            Health
          </Col>
        </Row>

        {positions.map((position, index) => {
          return <MintCard key={`${position.collateralTokenSymbol}-${position.loanTokenSymbol}-${index}`} position={position} />
        })}
      </Card.Body>
    </Card>
  )
}

export default MintSection
