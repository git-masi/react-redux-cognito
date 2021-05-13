import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './features/auth/Login';
import PrivateRoute from './features/auth/PrivateRoute';
import Signup from './features/auth/Signup';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/login">
          <Login />
        </Route>

        <Route exact path="/signup">
          <Signup />
        </Route>

        <PrivateRoute path="/user">
          <h1>You did it!</h1>
        </PrivateRoute>

        <Route path="/">
          <h1>Page Not Found</h1>
        </Route>
      </Switch>
    </Router>
  );
}
