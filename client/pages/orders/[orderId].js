import { useEffect, useState } from 'react';
// import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay {timeLeft} {timeLeft === 1 ? 'second' : 'seconds'}
      {/* <StripeCheckout
        token={({ id }) => doRequest({ token:id })}
        stripeKey="pk_test_51KfZvWH6hCIDmUaTrKc5pQ5i2iw5w9jqYgLFweZEhM0Go3FNpw9sMQJX15PJXIF5yIbK27quGepcxjrXpo0gRbB000iQsOxVfG"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      /> */}
      <button
        className="btn btn-primary"
        onClick={() => doRequest({ token: 'tok_visa' })}
      >
        Pay with card
      </button>
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};
export default OrderShow;
