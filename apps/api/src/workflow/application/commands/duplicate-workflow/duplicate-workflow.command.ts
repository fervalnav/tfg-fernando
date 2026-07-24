import { Command } from '@nestjs/cqrs';

export class DuplicateWorkflowCommand extends Command<void> {
  constructor(
    public readonly sourceId: string,
    public readonly newId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
