import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket, TicketDoc } from '../../models/Ticket';

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title,
    price,
  });
  await ticket.save();
  return ticket;
};
const makeOrder = async (ticket: TicketDoc, cookie: string[]) => {
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  return res;
};
it('fetches order for logged in user', async () => {
  // Create 3 tickets
  const ticket1 = await buildTicket('Joeboy stage performance', 10);
  const ticket2 = await buildTicket('Wizkid stage performance', 20);
  const ticket3 = await buildTicket('Davido stage performance', 30);

  const user1Cookie = signin();
  const user2Cookie = signin();

  // Create an order for User1
  const user1Order = await makeOrder(ticket1, user1Cookie);

  // Create 2 orders for User2
  const { body: user2Order1 } = await makeOrder(ticket2, user2Cookie);
  const { body: user2Order2 } = await makeOrder(ticket3, user2Cookie);

  // Make request to get User2 orders
  const user2Orders = await request(app)
    .get('/api/orders')
    .set('Cookie', user2Cookie)
    .expect(200);

  // Make sure only User2 orders are gotten
  expect(user2Orders.body.length).toEqual(2);
  expect(user2Orders.body[0].id).toEqual(user2Order1.id);
  expect(user2Orders.body[1].id).toEqual(user2Order2.id);
  expect(user2Orders.body[0].ticket.id).toEqual(ticket2.id);
  expect(user2Orders.body[1].ticket.id).toEqual(ticket3.id);
});
