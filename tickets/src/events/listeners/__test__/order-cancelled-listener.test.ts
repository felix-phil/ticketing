import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@fphtickets/common/build';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create fake data event
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'JoeBoy for life',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.orderId = orderId;
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  // create fake message object

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg, orderId };
};

it('it unlocks a ticket, publishes ticket updated and acks message', async () => {
  // setup
  const { data, listener, msg, ticket, orderId } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();

  // ensure ack() was called
  expect(msg.ack).toHaveBeenCalled();
  // ensures ticket updated event was published
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toBeUndefined();
});
