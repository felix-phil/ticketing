import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@fphtickets/common/build';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/Order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      price: data.ticket.price,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
