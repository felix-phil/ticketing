import React from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';

import { loadStripe } from '@stripe/stripe-js';

const CheckoutForm = ({ token = () => {}, amount, email }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: { email: email },
      metadata: { amount: amount },
    });

    if (!error) {
      token(paymentMethod);
    } else {
      console.log(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <CardElement />
      <button disabled={!stripe} type="submit" className="btn btn-info">
        Pay
      </button>
    </form>
  );
};

const PUBLIC_KEY =
  'pk_test_51KfZvWH6hCIDmUaTrKc5pQ5i2iw5w9jqYgLFweZEhM0Go3FNpw9sMQJX15PJXIF5yIbK27quGepcxjrXpo0gRbB000iQsOxVfG';

const stripeTestPromise = loadStripe(PUBLIC_KEY);

const StripeCheckout = ({ token, amount, email }) => {
  return (
    <Elements stripe={stripeTestPromise}>
      <CheckoutForm token={token} amount={amount} email={email} />
    </Elements>
  );
};

export default StripeCheckout;
