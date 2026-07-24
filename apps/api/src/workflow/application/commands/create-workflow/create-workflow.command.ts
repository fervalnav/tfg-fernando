import { Command } from '@nestjs/cqrs';

export class CreateWorkflowCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly description: string | null,
  ) {
    super();
  }
}
