import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import superagent from 'superagent';
import { updateTokens } from './authSlice';
import { useHistory } from 'react-router';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const history = useHistory();

  const onSubmit = async (data) => {
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
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-col flex-center m-center p-xy-2"
    >
      <label className="m-b-2">
        Username: <input {...register('username')} />
      </label>

      <label className="m-b-2">
        Password: <input {...register('password')} />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
