import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@fphtickets/common/build';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create fake data event
  const ticket = Ticket.build({
    title: 'JoeBoy for life',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // create fake message object

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it('marks a ticket as locked by assigning an orderId', async () => {
  // setup
  const { data, listener, msg, ticket } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket!.orderId).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);
  // ensure ack() was called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes an event', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);
  // ensure ack() was called
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
