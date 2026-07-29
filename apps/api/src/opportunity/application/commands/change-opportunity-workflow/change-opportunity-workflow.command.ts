import { Command } from '@nestjs/cqrs';

export class ChangeOpportunityWorkflowCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowId: string,
  ) {
    super();
  }
}
