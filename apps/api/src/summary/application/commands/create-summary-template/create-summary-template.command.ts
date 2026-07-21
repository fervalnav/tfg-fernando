import { Command } from '@nestjs/cqrs';

export class CreateSummaryTemplateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly prompt: string,
  ) {
    super();
  }
}
