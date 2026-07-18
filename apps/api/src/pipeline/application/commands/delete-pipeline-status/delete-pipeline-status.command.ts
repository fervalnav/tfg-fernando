import { Command } from '@nestjs/cqrs';

export class DeletePipelineStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly pipelineId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
