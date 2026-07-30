import { DomainEvent } from '@/shared/domain/domain-event';

export class SummaryAiGenerationRequestedEvent extends DomainEvent {
  readonly eventName = 'summary.ai-generation.requested';
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly summaryId: string,
  ) {
    super();
  }
}
