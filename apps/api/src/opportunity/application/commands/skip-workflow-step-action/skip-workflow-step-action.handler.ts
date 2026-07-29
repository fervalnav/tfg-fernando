import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { SkipWorkflowStepActionCommand } from './skip-workflow-step-action.command';

@CommandHandler(SkipWorkflowStepActionCommand)
export class SkipWorkflowStepActionHandler implements ICommandHandler<SkipWorkflowStepActionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: SkipWorkflowStepActionCommand): Promise<void> {
    await this.service.skipAction(command.opportunityId, command.accountId, command.actionId);
  }
}
