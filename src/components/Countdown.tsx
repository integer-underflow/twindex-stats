import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { getLockedTWINAmount } from '../modules/LockedTwin'
import { getAddressInQueryString } from '../modules/Utils'

const Countdown = () => {
  const [locked, setLocked] = useState<{
    amount: string
    valueInUsd: string
  }>({
    amount: '0.00',
    valueInUsd: '$0.00',
  })

  useEffect(() => {
    ;(async () => {
      const address = getAddressInQueryString()
      if (address) setLocked(await getLockedTWINAmount(address))
    })()
  }, [])

  return (
    <Card className="h-100">
      <Card.Body>
        <Row className="h-100 d-flex align-items-center">
          <Col md={4} className="text-center">
            <h4 className="m-0">{locked.amount}</h4>
            <small className="text-muted">({locked.valueInUsd})</small> <br />
            <small>TWIN Locked</small>
          </Col>
          <Col md={8} className="text-center">
            25 DAYS 09 HR 55 MIN 13 SEC <br />
            <small className="text-muted">until rewards unlock</small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default Countdown
