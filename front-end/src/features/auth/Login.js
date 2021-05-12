import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import superagent from 'superagent';
import { updateTokens } from './authSlice';
import { useHistory } from 'react-router';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const [authError, setAuthError] = useState(false);

  const onSubmit = async (data) => {
    try {
      const {
        body: { accountStatus, authenticationResult },
      } = await superagent
        .post(
          'https://z9zn346vaf.execute-api.us-east-1.amazonaws.com/dev/users/log-in'
        )
        .send(data);

      if (accountStatus === '') {
        dispatch(updateTokens(authenticationResult));
        history.push('/user');
      }
    } catch (error) {
      setAuthError(true);
    }
  };

  return (
    <>
      {authError ? (
        <h1>There was an error 💩</h1>
      ) : (
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

          <button type="submit">Submit</button>
        </form>
      )}
    </>
  );
}
