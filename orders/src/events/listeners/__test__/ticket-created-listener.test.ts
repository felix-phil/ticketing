import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@fphtickets/common/build';

import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';

const setup = async () => {
  // create instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 150,
    title: 'JoeBoy concert ticket',
  };
  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  // setup
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);
  // ensure ack() was called
  expect(msg.ack).toHaveBeenCalled();
});
