import { Command } from '@nestjs/cqrs';

export class DeleteWorkflowCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
