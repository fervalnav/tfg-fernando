import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { ChangeOpportunityWorkflowCommand } from './change-opportunity-workflow.command';

@CommandHandler(ChangeOpportunityWorkflowCommand)
export class ChangeOpportunityWorkflowHandler implements ICommandHandler<ChangeOpportunityWorkflowCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: ChangeOpportunityWorkflowCommand): Promise<void> {
    await this.service.assign(command.opportunityId, command.accountId, command.workflowId, true);
  }
}
