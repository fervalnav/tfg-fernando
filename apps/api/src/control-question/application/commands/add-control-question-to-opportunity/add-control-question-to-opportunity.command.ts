import { Command } from '@nestjs/cqrs';

export class AddControlQuestionToOpportunityCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly defaultControlQuestionId: string,
  ) {
    super();
  }
}
