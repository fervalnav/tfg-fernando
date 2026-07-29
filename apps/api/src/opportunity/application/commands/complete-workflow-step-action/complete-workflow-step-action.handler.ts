import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { CompleteWorkflowStepActionCommand } from './complete-workflow-step-action.command';

@CommandHandler(CompleteWorkflowStepActionCommand)
export class CompleteWorkflowStepActionHandler implements ICommandHandler<CompleteWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: CompleteWorkflowStepActionCommand): Promise<void> {
    await this.service.completeAction(command.opportunityId, command.accountId, command.actionId);
  }
}
