import { Container, Row, Col } from 'react-bootstrap'
import Header from './components/Header'

const App = () => {
  return (
    <>
      <Header />
      <Container>
        <Row>
          <Col md="3">TWINDEX Price</Col>
          <Col md="3">DOP Price</Col>
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
