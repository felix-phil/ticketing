import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@fphtickets/common/build';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
