import { Command } from '@nestjs/cqrs';

export class RetryWorkflowStepActionCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly actionId: string,
  ) {
    super();
  }
}
