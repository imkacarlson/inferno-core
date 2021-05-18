import React, { FC } from 'react';
import Header from 'components/Header';
import LandingPage from 'components/LandingPage';
import ThemeProvider from 'components/ThemeProvider';
import { Container } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import TestSessionWrapper from 'components/TestSuite/TestSessionWrapper';

const App: FC = () => {
  const presets = [
    {
      name: 'None',
      fhirServer: '',
      testSet: '',
    },
    {
      name: 'Demonstration Sequence',
      fhirServer: 'https://inferno.healthit.gov/reference-server/r4',
      testSet: 'DemoIG_STU1::DemoSuite',
    },
  ];

  return (
    <Router>
      <ThemeProvider>
        <Header chipLabel="Community" />
        <Container maxWidth="lg">
          <Switch>
            <Route exact path="/">
              <LandingPage presets={presets} />
            </Route>
            <Route path="/test_sessions/:test_session_id">
              <TestSessionWrapper />
            </Route>
          </Switch>
        </Container>
      </ThemeProvider>
    </Router>
  );
};

export default App;