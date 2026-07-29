import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { CheckAndAdvanceOpportunityWorkflowStepCommand } from '../commands/check-and-advance-opportunity-workflow-step';
import { WorkflowStepActionStatusChangedEvent } from './opportunity-workflow.events';

@EventsHandler(WorkflowStepActionStatusChangedEvent)
export class WorkflowStepActionStatusChangedHandler implements IEventHandler<WorkflowStepActionStatusChangedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: WorkflowStepActionStatusChangedEvent): Promise<void> {
    await this.commandBus.execute(
      new CheckAndAdvanceOpportunityWorkflowStepCommand(event.opportunityId, event.accountId),
    );
  }
}
