import { Command } from '@nestjs/cqrs';

export class AssignWorkflowToOpportunityCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly workflowId: string,
  ) {
    super();
  }
}
