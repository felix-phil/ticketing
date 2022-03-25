import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@fphtickets/common/build';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
