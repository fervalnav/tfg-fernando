import { Command } from '@nestjs/cqrs';

export class UpdateSummaryTemplateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string | undefined,
    public readonly prompt: string | undefined,
  ) {
    super();
  }
}
