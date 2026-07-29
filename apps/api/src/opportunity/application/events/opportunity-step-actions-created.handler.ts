import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { CheckAndAdvanceOpportunityWorkflowStepCommand } from '../commands/check-and-advance-opportunity-workflow-step';
import { TriggerOpportunityStepAutoExecuteCommand } from '../commands/trigger-opportunity-step-auto-execute';
import { OpportunityStepActionsCreatedEvent } from './opportunity-workflow.events';

@EventsHandler(OpportunityStepActionsCreatedEvent)
export class OpportunityStepActionsCreatedHandler implements IEventHandler<OpportunityStepActionsCreatedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OpportunityStepActionsCreatedEvent): Promise<void> {
    await this.commandBus.execute(new TriggerOpportunityStepAutoExecuteCommand(event.opportunityId, event.accountId));
    await this.commandBus.execute(
      new CheckAndAdvanceOpportunityWorkflowStepCommand(event.opportunityId, event.accountId),
    );
  }
}
