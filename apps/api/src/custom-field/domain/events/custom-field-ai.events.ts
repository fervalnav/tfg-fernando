import { DomainEvent } from '@/shared/domain/domain-event';

export class CustomFieldAiGenerationRequestedEvent extends DomainEvent {
  readonly eventName = 'custom-field.ai-generation.requested';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly customFieldId: string,
  ) {
    super();
  }
}
