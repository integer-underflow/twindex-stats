import { Card, Row, Col, ProgressBar } from 'react-bootstrap'
import { MintPosition } from '../modules/Loan'

interface Props {
  position: MintPosition
}

const MintCard = ({ position }: Props) => {
  return (
    <Card
      style={{
        border: '1px solid #374151',
        borderRadius: 20,
      }}
      className="mb-2"
    >
      <Card.Body className="py-2">
        <Row>
          <Col className="text-center" style={{ fontWeight: 300 }} md={5}>
            <div>
              <span className="d-md-block d-lg-none">Asset: </span>
              {position.loanTokenAmount} <small style={{ fontWeight: 200 }}>{position.loanTokenSymbol}</small>
            </div>
            <div>
            <span className="d-md-block d-lg-none">Collateral: </span>
              {position.collateralTokenAmount} <small style={{ fontWeight: 200 }}>{position.collateralTokenSymbol}</small>
            </div>
          </Col>
          <Col className="text-center d-flex align-items-center mt-2" style={{ fontWeight: 300 }} md={7}>
            <div className="w-100">
              <ProgressBar
                style={{
                  borderRadius: 30,
                }}
              >
                <ProgressBar variant="danger" now={parseFloat(position.maintenanceMargin)} />
                <ProgressBar now={parseFloat(position.margin)} label={`${position.margin}%`} />
              </ProgressBar>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default MintCard
