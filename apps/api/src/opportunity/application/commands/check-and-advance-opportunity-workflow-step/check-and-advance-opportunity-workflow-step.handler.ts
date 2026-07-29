import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { CheckAndAdvanceOpportunityWorkflowStepCommand } from './check-and-advance-opportunity-workflow-step.command';

@CommandHandler(CheckAndAdvanceOpportunityWorkflowStepCommand)
export class CheckAndAdvanceOpportunityWorkflowStepHandler implements ICommandHandler<
  CheckAndAdvanceOpportunityWorkflowStepCommand,
  void
> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: CheckAndAdvanceOpportunityWorkflowStepCommand): Promise<void> {
    await this.service.checkAndAdvance(command.opportunityId, command.accountId);
  }
}
