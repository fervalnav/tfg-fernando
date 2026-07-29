import { Command } from '@nestjs/cqrs';

export class AddSummaryToOpportunityCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly summaryTemplateId: string,
  ) {
    super();
  }
}
