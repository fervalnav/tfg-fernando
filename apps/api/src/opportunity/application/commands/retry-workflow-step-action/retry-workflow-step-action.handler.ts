import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { RetryWorkflowStepActionCommand } from './retry-workflow-step-action.command';

@CommandHandler(RetryWorkflowStepActionCommand)
export class RetryWorkflowStepActionHandler implements ICommandHandler<RetryWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: RetryWorkflowStepActionCommand): Promise<void> {
    await this.service.retryAction(command.opportunityId, command.accountId, command.actionId);
  }
}
