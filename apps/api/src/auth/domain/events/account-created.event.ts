import { DomainEvent } from '@/shared/domain/domain-event';

export class AccountCreatedEvent extends DomainEvent {
  readonly eventName = 'account.created';
  constructor(public readonly accountId: string) {
    super();
  }
}
