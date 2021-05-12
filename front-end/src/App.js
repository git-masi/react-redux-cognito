import React from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { selectAuth } from './features/auth/authSlice';
import Login from './features/auth/Login';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/login">
          <Login />
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

function PrivateRoute({ children, ...rest }) {
  const auth = useSelector(selectAuth);
  const hasTokens = ['AccessToken', 'RefreshToken', 'IdToken'].every(
    (key) => !!auth[key]
  );
  const authorized = hasTokens;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        authorized ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
