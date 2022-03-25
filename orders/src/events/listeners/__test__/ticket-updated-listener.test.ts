import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@fphtickets/common/build';

import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';

const setup = async () => {
  // create instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a new ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 150,
    title: 'JoeBoy concert ticket',
  });
  await ticket.save();
  // create fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    price: 120,
    title: 'JoeBoy concert ticketing',
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('it finds, creates and saves a ticket', async () => {
  // setup
  const { data, listener, msg, ticket } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);
  // ensure ack() was called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack with out-of-version ticket', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  data.version = 10;
  // call onMessage function  with data event and message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  // ensure ack() was called
  expect(msg.ack).not.toHaveBeenCalled();
});
