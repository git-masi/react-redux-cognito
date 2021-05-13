import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import superagent from 'superagent';

export default function Signup() {
  const { register, handleSubmit } = useForm();
  const [emailTaken, setEmailTaken] = useState(false);
  const history = useHistory();

  const onSubmit = async (data) => {
    try {
      const {
        body: { accountStatus },
      } = await superagent
        .post(
          'https://z9zn346vaf.execute-api.us-east-1.amazonaws.com/dev/users/sign-up'
        )
        .send(data);

      if (accountStatus === 'FORCE_CHANGE_PASSWORD') history.push('/login');
    } catch (error) {
      if (error.status === 409) setEmailTaken(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-col flex-center m-center p-xy-2"
    >
      <input type="email" {...register('email')} />

      {emailTaken && (
        <p className="text-red">
          <strong>That email address is already in use 😔</strong>
        </p>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
