import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import { OpportunityWorkflowStepEnteredEvent } from './opportunity-workflow.events';

@EventsHandler(OpportunityWorkflowStepEnteredEvent)
export class OpportunityWorkflowStepEnteredHandler implements IEventHandler<OpportunityWorkflowStepEnteredEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async handle(event: OpportunityWorkflowStepEnteredEvent): Promise<void> {
    await this.service.initializeCurrentStep(event.opportunityId, event.accountId, event.workflowStepId);
  }
}
