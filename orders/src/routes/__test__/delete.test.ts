import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/Order';
import { Ticket } from '../../models/Ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns error with not logged on user', async () => {
  await request(app).delete('/api/orders/sfkasdkfaslf').send().expect(401);
});

it('returns error if order does not belong to user', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'JoeBoy play',
    price: 10,
  });
  await ticket.save();

  const userCookie = signin();

  const { body: orderBody } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderBody.id)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

it('marks order as cancelled', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'JoeBoy play',
    price: 10,
  });
  await ticket.save();

  const userCookie = signin();

  const { body: orderBody } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderBody.id)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(orderBody.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'JoeBoy play',
    price: 10,
  });
  await ticket.save();

  const userCookie = signin();

  const { body: orderBody } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderBody.id)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
