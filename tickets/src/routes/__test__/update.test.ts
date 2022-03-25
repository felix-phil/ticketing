import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

const title = 'Joe Boy Concert';
const price = 1000;
const id = new mongoose.Types.ObjectId().toHexString();

it('should return a 404 if id not found', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(404);
});

it('should return a 401 if user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    // .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(401);
});

it('should return a 401 if user does not own the ticket', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(401);
});

it('should return a 400 if invalid title or price is supplied', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title, price: -1 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('should return update successfully if all requirements are met', async () => {
  const cookie = global.signin();

  const newTitle = 'Joe Boy Live Performance';
  const newPrice = 1500;

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);
  expect(res2.body.title).toEqual(newTitle);
  expect(res2.body.price).toEqual(newPrice);
  expect(res.body.id).toEqual(res2.body.id);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res2.body.id}`)
    .send()
    .expect(200);
  expect(ticketRes.body.title).toEqual(newTitle);
  expect(ticketRes.body.price).toEqual(newPrice);
  expect(ticketRes.body.id).toEqual(res.body.id);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const newTitle = 'Joe Boy Live Performance';
  const newPrice = 1500;

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if ticket is reserved', async () => {
  const cookie = global.signin();

  const newTitle = 'Joe Boy Live Performance';
  const newPrice = 1500;

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title, price })
    .expect(201);

  const ticket = await Ticket.findById(res.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(400);
});
