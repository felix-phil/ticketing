import {
  Publisher,
  Subjects,
  PaymentCreatedEvent,
} from '@fphtickets/common/build';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
