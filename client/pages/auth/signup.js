import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { errors, doRequest } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: (res) => Router.push('/'),
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    doRequest();
  };
  return (
    <div className="container">
      <div className="row">
        <form onSubmit={onSubmitHandler}>
          <h1>Sign Up</h1>
          <div className="form-group">
            <label className="form-control-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              name="email"
            />
          </div>
          <div className="form-group">
            <label className="form-control-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              name="password"
            />
          </div>
          {errors}
          <div className="form-group mt-5">
            <button type="submit" className="btn btn-success btn-md">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
