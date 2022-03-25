import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { Ticket } from '../../models/Ticket';

it('returns error with not logged on user', async () => {
  await request(app).get('/api/orders/sfkasdkfaslf').send().expect(401);
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
    .get('/api/orders/' + orderBody.id)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

it('fetches the order', async () => {
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

  const { body: orderGet } = await request(app)
    .get('/api/orders/' + orderBody.id)
    .set('Cookie', userCookie)
    .send()
    .expect(200);
  expect(orderGet.id).toEqual(orderBody.id);
});
