import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from '@fphtickets/common/build';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
