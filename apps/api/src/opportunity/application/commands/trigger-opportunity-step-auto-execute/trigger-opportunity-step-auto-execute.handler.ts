import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { TriggerOpportunityStepAutoExecuteCommand } from './trigger-opportunity-step-auto-execute.command';

@CommandHandler(TriggerOpportunityStepAutoExecuteCommand)
export class TriggerOpportunityStepAutoExecuteHandler implements ICommandHandler<
  TriggerOpportunityStepAutoExecuteCommand,
  void
> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: TriggerOpportunityStepAutoExecuteCommand): Promise<void> {
    await this.service.autoExecute(command.opportunityId, command.accountId);
  }
}
