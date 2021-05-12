import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { selectAuth } from './authSlice';

export default function PrivateRoute({ children, ...rest }) {
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
