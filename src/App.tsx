import { Container, Row, Col } from 'react-bootstrap'
import Countdown from './components/Countdown'
import Header from './components/Header'
import LPTable from './components/LPTable'
import MintTable from './components/MintTable'
import PriceCard from './components/PriceCard'
import StockTable from './components/StockTable'

const App = () => {
  return (
    <>
      <Header />
      <Container>
        <Row>
          <Col md="3">
            <PriceCard symbol="TWINDEX" price={20} />
          </Col>
          <Col md="3">
            <PriceCard symbol="DOP" price={15} />
          </Col>
          <Col md="6">
            <Countdown />
          </Col>
          <Col md="12" className="mt-3">
            <h2 className="text-primary">LP Holdings</h2>
            <LPTable />
          </Col>
          <Col md="6" className="mt-3">
            <h2>Mint Positions</h2>
            <MintTable />
          </Col>
          <Col md="6" className="mt-3">
            <h2>Stock Price</h2>
            <StockTable />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App
