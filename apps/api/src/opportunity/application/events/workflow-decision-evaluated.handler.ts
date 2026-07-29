import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import { WorkflowDecisionEvaluatedEvent } from './opportunity-workflow.events';

@EventsHandler(WorkflowDecisionEvaluatedEvent)
export class WorkflowDecisionEvaluatedHandler implements IEventHandler<WorkflowDecisionEvaluatedEvent> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async handle(event: WorkflowDecisionEvaluatedEvent): Promise<void> {
    await this.service.applyDecision(event);
  }
}
