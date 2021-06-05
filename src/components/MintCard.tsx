import { Card, Row, Col, ProgressBar } from 'react-bootstrap'

interface Props {
  asset: {
    name: string
    value: number
  }
  collateral: {
    name: string
    value: number
  }
  health: number
}

const MintCard = ({ asset, collateral, health }: Props) => {
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
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            {asset.value} {asset.name}
          </Col>
          <Col className="text-center" style={{ fontWeight: 300 }} md={4}>
            {collateral.value} {collateral.name}
          </Col>
          <Col className="text-center d-flex align-items-center" style={{ fontWeight: 300 }} md={4}>
            <div className="w-100">
              <ProgressBar
                now={health}
                label={`${health}%`}
                style={{
                  borderRadius: 30,
                }}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default MintCard
