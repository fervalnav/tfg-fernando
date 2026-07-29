import { Command } from '@nestjs/cqrs';

export class ReEvaluateWorkflowDecisionCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowStepId: string,
  ) {
    super();
  }
}
