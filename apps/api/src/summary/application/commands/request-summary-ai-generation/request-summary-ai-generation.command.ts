import { Command } from '@nestjs/cqrs';

export class RequestSummaryAiGenerationCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly summaryId: string,
  ) {
    super();
  }
}
