import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { natsWrapper } from '../../nats-wrapper';

it('should have route listening to /api/tickets for POST requests', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if a user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns other status code other than 401', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if wrong title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price: 5000, title: '' })
    .expect(400);
  // No title at all
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price: 5000 })
    .expect(400);
});

it('returns an error if wrong price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Hello', price: -10 })
    .expect(400);
  // No price at all
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Hello' })
    .expect(400);
});
it('successfully creates a ticket if valid details are provided', async () => {
  // Check for database ops
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'Joe Boy Concert';
  const price = 10;

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
  const title = 'Joe Boy Concert';
  const price = 10;

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
