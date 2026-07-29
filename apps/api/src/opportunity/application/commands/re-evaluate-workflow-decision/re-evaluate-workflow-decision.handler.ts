import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { ReEvaluateWorkflowDecisionCommand } from './re-evaluate-workflow-decision.command';

@CommandHandler(ReEvaluateWorkflowDecisionCommand)
export class ReEvaluateWorkflowDecisionHandler implements ICommandHandler<ReEvaluateWorkflowDecisionCommand, void> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(command: ReEvaluateWorkflowDecisionCommand): Promise<void> {
    await this.service.requestDecisionEvaluation(command.opportunityId, command.accountId, command.workflowStepId);
  }
}
