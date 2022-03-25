import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { OrderStatus } from '@fphtickets/common/build';
import { stripe } from '../../stripe';
import { Payment } from '../../models/Payment';
// jest.mock('../../stripe');

it('returns a 404 if order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'dakfdakj',
    })
    .expect(404);
});

it('returns a 401 if order does not belong to current user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 50,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      orderId: order.id,
      token: 'dakfdakj',
    })
    .expect(401);
});

it('returns a 400 if order dis already cancelled', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    price: 50,
    userId: userId,
    version: 0,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
      token: 'dakfdakj',
    })
    .expect(400);
});

// it('returns a 201 with valid inputs', async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();

//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     status: OrderStatus.Created,
//     price: 50,
//     userId: userId,
//     version: 0,
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', signin(userId))
//     .send({
//       orderId: order.id,
//       token: 'tok_visa',
//     })
//     .expect(201);

//   expect(stripe.charges.create).toHaveBeenCalled();
//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(order.price * 100);
//   expect(chargeOptions.currency).toEqual('usd');
// });

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: price,
    userId: userId,
    version: 0,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
