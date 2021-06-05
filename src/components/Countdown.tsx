import { useEffect, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { getLockedTWINAmount, getUnlockDate } from '../modules/LockedTwin'
import { getAddressInQueryString } from '../modules/Utils'
import ReactCountdown, { CountdownTimeDelta } from 'react-countdown'
import InfoTooltip from './InfoTooltip'

const UnitRender = ({ value, unit }: { value: number | string; unit: string }) => {
  return (
    <>
      {value}&nbsp;
      <small
        style={{
          fontWeight: 200,
        }}
      >
        {unit}
      </small>
    </>
  )
}

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownTimeDelta) => {
  if (completed) return <span>Unlocked</span>
  return (
    <span>
      <UnitRender value={days} unit="DAYS" />
      &nbsp; &nbsp;
      <UnitRender value={hours} unit="HR" />
      &nbsp; &nbsp;
      <UnitRender value={minutes} unit="MIN" />
      &nbsp; &nbsp;
      <UnitRender value={seconds} unit="SEC" />
    </span>
  )
}

const CountdownPlaceholder = () => {
  return (
    <span>
      <UnitRender value="-" unit="DAYS" />
      &nbsp; &nbsp;
      <UnitRender value="-" unit="HR" />
      &nbsp; &nbsp;
      <UnitRender value="-" unit="MIN" />
      &nbsp; &nbsp;
      <UnitRender value="-" unit="SEC" />
    </span>
  )
}

const Countdown = () => {
  const [locked, setLocked] = useState<{
    amount: string
    valueInUsd: string
  }>({
    amount: '0.00',
    valueInUsd: '$0.00',
  })
  const [unlockDate, setUnlockDate] = useState(0)

  useEffect(() => {
    ;(async () => {
      const address = getAddressInQueryString()
      if (address) setLocked(await getLockedTWINAmount(address))
      setUnlockDate(await getUnlockDate())
    })()
  }, [])

  return (
    <Card className="h-100">
      <Card.Body>
        <Row className="h-100 d-flex align-items-center">
          <Col md={12} lg={4} className="text-center">
            <h4 className="m-0">{locked.amount}</h4>
            <small className="text-muted">({locked.valueInUsd})</small> <br />
            <small>TWIN Locked</small>
          </Col>
          <Col md={12} lg={8} className="text-center">
            <hr className="d-lg-none d-md-block" />
            <h4 className="m-0">
              {unlockDate !== 0 ? <ReactCountdown date={unlockDate} renderer={CountdownRenderer} /> : <CountdownPlaceholder />}
            </h4>
            <small className="text-muted">
              until rewards unlock{' '}
              <InfoTooltip
                placement="right"
                text="The locked rewards will unlock approximately 30 days, and then be released linearly across one month within blocks 8763010->9627010"
              />
            </small>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default Countdown
