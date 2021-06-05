import { useEffect, useState } from 'react'
import { Card, Row, Col, Spinner } from 'react-bootstrap'
import { getLPs, LPPrice } from '../modules/LiquidityPool'
import { getAddressInQueryString } from '../modules/Utils'
import LPCard from './LPCard'
import LPTotalCard from './LPTotalCard'

const LPSection = () => {
  const [LPs, setLPs] = useState<LPPrice[] | undefined>([])
  const [totalLP, setTotalLP] = useState<any>({})

  useEffect(() => {
    ;(async () => {
      const address = getAddressInQueryString()
      if (address) {
        const lps = await getLPs(address)
        setLPs(lps.lps)
        setTotalLP(lps.total)
      } else {
        setLPs(undefined)
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

        <Row className="mb-3 mx-1 d-none d-lg-flex">
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            LP Tokens Name
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Underlying Assets
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={3}>
            Pending TWIN
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={2}>
            Total Value
          </Col>
        </Row>

        {LPs !== undefined ? (
          <>
            {!LPs.length && (
              <div className="text-center w-100 mt-5 mb-4">
                <Spinner animation="border" />
              </div>
            )}

            {LPs.map((lp, index) => {
              return <LPCard key={index} lp={lp} />
            })}

            {!!LPs.length && <LPTotalCard lp={totalLP} />}
          </>
        ) : (
          <div className="text-center text-muted w-100 mt-5 mb-4">No Wallet Connected </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default LPSection
