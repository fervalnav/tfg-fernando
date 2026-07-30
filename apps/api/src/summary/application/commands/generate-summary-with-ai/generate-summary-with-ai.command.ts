import { Command } from '@nestjs/cqrs';

export class GenerateSummaryWithAiCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly summaryId: string,
  ) {
    super();
  }
}
