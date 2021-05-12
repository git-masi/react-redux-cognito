import React from 'react';
import { useForm } from 'react-hook-form';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

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
