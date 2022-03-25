import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@fphtickets/common/build';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
