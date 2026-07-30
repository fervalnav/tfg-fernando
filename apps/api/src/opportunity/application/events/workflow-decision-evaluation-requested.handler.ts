import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { EvaluateWorkflowDecisionWithAiCommand } from '../commands/evaluate-workflow-decision-with-ai';
import { WorkflowDecisionEvaluationRequestedEvent } from './opportunity-workflow.events';

@EventsHandler(WorkflowDecisionEvaluationRequestedEvent)
export class WorkflowDecisionEvaluationRequestedHandler implements IEventHandler<WorkflowDecisionEvaluationRequestedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: WorkflowDecisionEvaluationRequestedEvent): Promise<void> {
    await this.commandBus.execute(
      new EvaluateWorkflowDecisionWithAiCommand(event.opportunityId, event.accountId, event.workflowStepId),
    );
  }
}
