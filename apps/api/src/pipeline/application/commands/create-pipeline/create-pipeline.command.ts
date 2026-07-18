import { Command } from '@nestjs/cqrs';

export class CreatePipelineCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly name: string,
  ) {
    super();
  }
}
