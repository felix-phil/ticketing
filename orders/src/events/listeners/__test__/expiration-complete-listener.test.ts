import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from '@fphtickets/common/build';

import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';
import { Order, OrderStatus } from '../../../models/Order';

const setup = async () => {
  // create instance of listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create fake data event

  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'JoeBoy Concert',
    price: 100,
  });
  await ticket.save();

  // create order
  const order = Order.build({
    ticket: ticket,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order, ticket };
};

it('updates order status to cancelled', async () => {
  // setup
  const { data, listener, msg, order } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure order was cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  // setup()
  const { data, listener, msg, order } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const orderCancelledEventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(orderCancelledEventData.id).toEqual(order.id);
});

it('acks the published message', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // it acks the message
  expect(msg.ack).toHaveBeenCalled();
});
