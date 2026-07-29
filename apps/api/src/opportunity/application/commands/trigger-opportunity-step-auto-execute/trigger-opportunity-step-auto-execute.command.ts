import { Command } from '@nestjs/cqrs';

export class TriggerOpportunityStepAutoExecuteCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
