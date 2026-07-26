import { Command } from '@nestjs/cqrs';

export class UpdateOpportunityPositionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly sortPoints: number,
    public readonly pipelineStatusId: string | undefined,
  ) {
    super();
  }
}
