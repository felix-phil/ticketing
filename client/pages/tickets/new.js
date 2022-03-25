import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const onBlurHandler = (e) => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    doRequest();
  };
  return (
    <div className="row">
      <form onSubmit={onSubmitHandler}>
        <h1>Create new ticket</h1>
        <div className="form-group">
          <label className="form-control-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            name="title"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="form-control-label">Price</label>
          <input
            type="number"
            value={price}
            onBlur={onBlurHandler}
            onChange={(e) => setPrice(e.target.value)}
            name="price"
            className="form-control"
          />
        </div>
        {errors}
        <button type="submit" className="mt-5 btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
