import { Command } from '@nestjs/cqrs';

export class ReorderPipelineStatusesCommand extends Command<void> {
  constructor(
    public readonly pipelineId: string,
    public readonly accountId: string,
    public readonly ids: string[],
  ) {
    super();
  }
}
