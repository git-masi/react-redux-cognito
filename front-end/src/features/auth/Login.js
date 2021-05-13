import React, { useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import superagent from 'superagent';
import { updateTokens } from './authSlice';
import { useHistory } from 'react-router';

export const accountStatuses = Object.freeze({
  NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED',
});

const viewKeys = Object.freeze({
  error: 'error',
  newPassword: 'newPassword',
  login: 'login',
});

const allFalse = {
  [viewKeys.error]: false,
  [viewKeys.newPassword]: false,
  [viewKeys.login]: false,
};

const initialState = {
  ...allFalse,
  [viewKeys.login]: true,
};

function viewReducer(state, action) {
  switch (action.type) {
    case viewKeys.error:
      return { ...allFalse, error: true };
    case viewKeys.newPassword:
      return { ...allFalse, newPassword: true };
    case viewKeys.login:
      return { ...allFalse, login: true };
    default:
      throw new Error();
  }
}

export default function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const [view, dispatchView] = useReducer(viewReducer, initialState);

  const onSubmit = async (data) => {
    try {
      const {
        body: { accountStatus, authenticationResult },
      } = await superagent
        .post(
          'https://z9zn346vaf.execute-api.us-east-1.amazonaws.com/dev/users/log-in'
        )
        .send(data);

      if (
        authenticationResult?.AccessToken &&
        authenticationResult?.IdToken &&
        authenticationResult?.RefreshToken
      ) {
        dispatch(updateTokens(authenticationResult));
        return history.push('/user');
      }

      if (accountStatus === accountStatuses.NEW_PASSWORD_REQUIRED) {
        return dispatchView({ type: viewKeys.newPassword });
      }

      throw new Error('oops');
    } catch (error) {
      dispatchView({ type: viewKeys.error });
    }
  };

  return (
    <>
      {view.error && <h1>There was an error 💩</h1>}

      {(view.login || view.newPassword) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-col flex-center m-center p-xy-2"
        >
          <label className="m-b-2">
            Username: <input type="text" {...register('username')} />
          </label>

          <label className="m-b-2">
            Password: <input type="password" {...register('password')} />
          </label>

          {view.newPassword && (
            <>
              <label className="m-b-2">
                New Password:{' '}
                <input type="password" {...register('newPassword')} />
              </label>

              <p>Please enter a new password 🥺</p>
            </>
          )}

          <button type="submit">Submit</button>
        </form>
      )}
    </>
  );
}
