import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import { OpportunityQualificationGenerationFailedEvent } from './opportunity-workflow.events';

@EventsHandler(OpportunityQualificationGenerationFailedEvent)
export class OpportunityQualificationGenerationFailedHandler implements IEventHandler<OpportunityQualificationGenerationFailedEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async handle(event: OpportunityQualificationGenerationFailedEvent): Promise<void> {
    await this.service.failQualificationActions(
      event.opportunityId,
      event.accountId,
      event.targetType,
      event.targetId,
      event.errorMessage,
    );
  }
}
