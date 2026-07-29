import { Command } from '@nestjs/cqrs';

export class UpdateSummaryResultCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly summaryId: string,
    public readonly result: string,
  ) {
    super();
  }
}
