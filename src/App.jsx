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

  const [controller, setController] = React.useState(null);

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
          <header id="home" className="masthead">
            <Container>
              {/* Desktop view */}
              <div className="d-none d-lg-block">
                <div className="d-flex flex-row py-5">
                  <div className="d-flex flex-column me-auto my-4">
                    <h4 className="title text-center">
                      Convert to BEP-20 token.
                    </h4>
                  </div>
                </div>
              </div>
              {/* Mobile */}
              <div className="d-lg-none">
                <div className="d-flex flex-column py-5">
                  <div className="d-flex flex-column me-auto mt-4 mb-auto">
                    <h2 className="title text-center">
                      Convert to BEP-20 token.
                    </h2>
                  </div>
                </div>
              </div>
            </Container>
          </header>
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
                    This portal will remain open for N !timeframe!. Once deposit is made you will be able to mint your tokens
                    in 1~ month. If you have any questions please contact us in Discord. ~insert link here~
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
                  <button
                    onClick={() => {
                      setController("Binance Smart Chain (BSC)");
                    }}
                    className="btn btn-primary"
                  >
                    Enter
                  </button>
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
