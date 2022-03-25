import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@fphtickets/common/build';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/Order';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create fake data event

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };
  // create fake message object

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it('marks order status as cancelled', async () => {
  // setup
  const { data, listener, msg, order } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure order was created
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder).toBeDefined();
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  // setup()
  const { data, listener, msg } = await setup();

  // call onMessage function  with data event and message object
  await listener.onMessage(data, msg);

  // ensure ack() was called
  expect(msg.ack).toHaveBeenCalled();
});
