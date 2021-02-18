import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import InfoForm from './pages/InfoForm'
import ThankyouPage from './pages/ThankyouPage'
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/khaibao' component={InfoForm} />
        <Route exact path='/thankyou' component={ThankyouPage} />
      </Switch>
    </Router>
  );
}

export default App;
