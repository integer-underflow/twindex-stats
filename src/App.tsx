import { Container, Row, Col } from 'react-bootstrap'
import Countdown from './components/Countdown'
import Header from './components/Header'
import LPTable from './components/LPSection'
import MintTable from './components/MintSection'
import PriceCard from './components/PriceCard'
import StockTable from './components/StockSection'

const App = () => {
  return (
    <>
      <Header />
      <Container className="mt-3">
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
            <LPTable />
          </Col>
          <Col md="6" className="mt-3">
            <MintTable />
          </Col>
          <Col md="6" className="mt-3">
            <StockTable />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App
