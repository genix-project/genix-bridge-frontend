import "./App.scss";
import BscController from "./BscController";

// Controls.
import {
  Navbar,
  Nav,
  Container,
  Dropdown,
  DropdownButton,
  Row
} from "react-bootstrap";

// Assets.
import FadeInSection from "./FadeInSection";
//TODO: picture
import GenixLogo from "./assets/img/dingocoin.png";

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Maintenance from "./Maintenance";

export default function App() {
  // GA Analytics, Uncomment below, add your GA Measurement ID 	
  {/*
  ReactGA.initialize("ID-HERE");  <-- Enter GA Measurement ID Here
  ReactGA.pageview(window.location.pathname + window.location.search);

  const [location, setLocation] = React.useState(null);
  React.useEffect(() => {
    setLocation(window.location.pathname);
  }, []);
  React.useEffect(() => {}, [location]); */}

  // const [controller, setController] = React.useState(null);
  const controller = "Binance Smart Chain (BSC)"

  {/* Maint Mode Toggle  'const maintenance' = -- true = on  | false = off */ }
  const maintenance = false;
  const testnetEnabled = false;
  return (
    <Router>
      {maintenance ? (
        <Maintenance />
        
      ) : (
        <div className="App">
          <Navbar className="navbar" bg="dark" expand="lg" sticky="top">
            <Container>
              <Navbar.Brand href="/" className="navbar-brand align-items-center">
                {/* <img alt="" src={GenixLogo} /> */}
                <span>GENIX</span>
                <span className="navbar-brand-subtitle"> Converter</span>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse>
                <Nav className="ms-auto">
                  <Nav.Link
                    href="https://www.genix.cx"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <b>Visit Genix</b>
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <section className="features">
            <Container className="py-5 mt-5">
              <FadeInSection>
                <h2 className="mb-3 text-center">Genix Converter</h2>
                <h5 className="mb-3 text-center"><strong>Whats this?</strong></h5>
                <h5 className="mb-3 ">
                  <p>
                    This is a portal that allows the conversion of native GENIX to BEP-20 standard token GENIX.
                    Genix future is as a token. 
                  </p>
                  <p>
                    This portal will remain open for at minimum 1 year. Once deposit is made you will be able to mint your tokens
                    in 2~ weeks. If you have any questions please contact us in our Discord: https://discord.gg/RSc7CKr5mb
                  </p>
                </h5>
                <br />
                <br />
                <h5 className="mb-3 text-center">
                  <p className="mb-0">
                    1 GENIX = 1 GENIX BEP-20 token
                  </p>
                </h5>
                <br />
                <h5 className="mb-3 text-center">
                </h5>
              </FadeInSection>
            </Container>
          </section>
          <section>
            <Container>
              <h5 className="mt-3 text-center">
                {controller === "Binance Smart Chain (BSC)" && <BscController />}
              </h5>
            </Container>
          </section>
          <section className="section-footer text-center">
            <Row>
              <span>
                <b>© The Genix Project 2024 - 2024</b>
              </span >
            </Row >
          </section >
        </div >
      )}
    </Router >
  );
}
