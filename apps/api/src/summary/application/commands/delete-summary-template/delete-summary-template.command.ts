import { Command } from '@nestjs/cqrs';

export class DeleteSummaryTemplateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
