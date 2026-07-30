import { Command } from '@nestjs/cqrs';

export class GenerateControlQuestionAnswerWithAiCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly controlQuestionId: string,
  ) {
    super();
  }
}
