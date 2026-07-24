import { Command } from '@nestjs/cqrs';

export class DeleteDefaultStepActionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly workflowId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
