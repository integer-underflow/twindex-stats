import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from './components/Countdown'
import Footer from './components/Footer'
import Header from './components/Header'
import LPTable from './components/LPSection'
import MintSection from './components/MintSection'
import PriceCard from './components/PriceCard'
import StockTable from './components/StockSection'
import { getDopplePrice, getTwinPrice } from './modules/GovernanceToken'

const App = () => {
  const [twinPrice, setTwinPrice] = useState('')
  const [dopplePrice, setDopplePrice] = useState('')

  useEffect(() => {
    ;(async () => {
      setTwinPrice(await getTwinPrice())
      setDopplePrice(await getDopplePrice())
    })()
  }, [])

  return (
    <>
      <Header />
      <Container className="pb-5" style={{ minHeight: '88vh' }}>
        <Row>
          <Col md="6" lg="3">
            <PriceCard symbol="TWIN" price={twinPrice} />
          </Col>
          <Col md="6" lg="3" className="mt-4 mt-md-0">
            <PriceCard symbol="DOP" price={dopplePrice} />
          </Col>
          <Col md="12" lg="6" className="mt-4 mt-lg-0">
            <Countdown />
          </Col>
          <Col lg="12" className="mt-4">
            <LPTable />
          </Col>
          <Col md="12" lg="6" className="mt-4">
            <MintSection />
          </Col>
          <Col md="12" lg="6" className="mt-4">
            <StockTable />
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default App
