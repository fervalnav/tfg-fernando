import { Command } from '@nestjs/cqrs';
import type { ControlQuestionAnswer } from '@tfg/types';

export class AnswerControlQuestionCommand extends Command<void> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
    public readonly controlQuestionId: string,
    public readonly answer: Exclude<ControlQuestionAnswer, null>,
  ) {
    super();
  }
}
