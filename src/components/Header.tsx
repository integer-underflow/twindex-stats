import { useState } from 'react'
import { Container, Nav, Navbar, Form, Button, InputGroup } from 'react-bootstrap'
import { getAddressInQueryString } from '../modules/Utils'

const AddressForm = () => {
  const [address, setAddress] = useState(getAddressInQueryString() ?? '')

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
          <Button variant="primary" size="sm" type="submit">
            Search
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  )
}

const Header = () => {
  return (
    <Container>
      <Navbar variant="dark" expand="lg" className="mt-2">
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
