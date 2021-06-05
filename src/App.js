import { Container, Row, Col } from 'react-bootstrap'
import Header from './components/Header'
import PriceCard from './components/PriceCard'

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
          <Col md="6">TWINDEX Countdown</Col>
          <Col md="12">LP Holdings</Col>
          <Col md="6">Mint Positions</Col>
          <Col md="6">Stock Price</Col>
        </Row>
      </Container>
    </>
  )
}

export default App
