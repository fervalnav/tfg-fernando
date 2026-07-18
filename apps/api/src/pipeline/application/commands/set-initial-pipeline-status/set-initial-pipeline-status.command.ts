import { Command } from '@nestjs/cqrs';

export class SetInitialPipelineStatusCommand extends Command<void> {
  constructor(
    public readonly statusId: string,
    public readonly pipelineId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
