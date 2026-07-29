import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { AssignWorkflowToOpportunityCommand } from './assign-workflow-to-opportunity.command';

@CommandHandler(AssignWorkflowToOpportunityCommand)
export class AssignWorkflowToOpportunityHandler implements ICommandHandler<AssignWorkflowToOpportunityCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: AssignWorkflowToOpportunityCommand): Promise<void> {
    await this.service.assign(command.opportunityId, command.accountId, command.workflowId, false);
  }
}
