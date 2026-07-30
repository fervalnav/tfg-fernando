import { DomainEvent } from '@/shared/domain/domain-event';

export class ControlQuestionAiGenerationRequestedEvent extends DomainEvent {
  readonly eventName = 'control-question.ai-generation.requested';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly controlQuestionId: string,
  ) {
    super();
  }
}
