import { useState, useCallback } from 'react'
import { Container, Nav, Navbar, Form, Button, InputGroup } from 'react-bootstrap'
import { getAddressInQueryString } from '../modules/Utils'

const AddressForm = () => {
  const [address, setAddress] = useState(getAddressInQueryString() ?? '')

  const handleSearch = useCallback(() => {
    window.location.href = `?address=${address}`
  }, [address])

  const handleWalletConnect = useCallback(async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      // @ts-ignore
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      window.location.href = `?address=${account}`
    } else {
      alert('MetaMask is not installed!')
    }
  }, [])

  return (
    <Form inline>
      <InputGroup>
        <Form.Control
          placeholder="Wallet Address"
          name="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
          }}
          aria-label="Wallet Address"
          size="sm"
        />
        <InputGroup.Append>
          <Button variant="primary" size="sm" type="button" name="search" onClick={handleSearch}>
            <i className="fa fa-search" />
          </Button>
        </InputGroup.Append>
      </InputGroup>

      <Button variant="primary" size="sm" className="ml-2" type="button" onClick={handleWalletConnect}>
        Connect to a wallet
      </Button>
    </Form>
  )
}

const Header = () => {
  return (
    <Container style={{ minHeight: '6vh' }}>
      <Navbar variant="dark" expand="lg">
        <Navbar.Brand href="#">
          <b
            style={{
              letterSpacing: 4,
              fontWeight: 600,
            }}
          >
            TWINDEX
          </b>{' '}
          <span
            style={{
              fontWeight: 200,
            }}
          >
            Stats
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {/* <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link> */}
          </Nav>
          <AddressForm />
        </Navbar.Collapse>
      </Navbar>
    </Container>
  )
}

export default Header
