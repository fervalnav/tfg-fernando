import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { AssignWorkflowToOpportunityCommand } from '../commands/assign-workflow-to-opportunity';
import { OpportunityCreatedEvent } from './opportunity-workflow.events';

@EventsHandler(OpportunityCreatedEvent)
export class OpportunityCreatedWorkflowHandler implements IEventHandler<OpportunityCreatedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OpportunityCreatedEvent): Promise<void> {
    if (!event.workflowId) return;
    await this.commandBus.execute(
      new AssignWorkflowToOpportunityCommand(event.opportunityId, event.accountId, event.workflowId),
    );
  }
}
