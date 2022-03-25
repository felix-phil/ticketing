import {
  Publisher,
  Subjects,
  OrderCreatedEvent,
} from '@fphtickets/common/build';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
