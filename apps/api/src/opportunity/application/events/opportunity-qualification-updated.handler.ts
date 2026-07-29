import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import { OpportunityQualificationUpdatedEvent } from './opportunity-workflow.events';

@EventsHandler(OpportunityQualificationUpdatedEvent)
export class OpportunityQualificationUpdatedHandler implements IEventHandler<OpportunityQualificationUpdatedEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async handle(event: OpportunityQualificationUpdatedEvent): Promise<void> {
    await this.service.completeQualificationActions(
      event.opportunityId,
      event.accountId,
      event.targetType,
      event.targetId,
    );
  }
}
