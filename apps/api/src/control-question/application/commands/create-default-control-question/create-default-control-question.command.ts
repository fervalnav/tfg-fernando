import { Command } from '@nestjs/cqrs';
import type { AnswerType } from '../../../domain/default-control-question.entity';

export class CreateDefaultControlQuestionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly question: string,
    public readonly answerType: AnswerType,
    public readonly passConditionPrompt: string | null,
  ) {
    super();
  }
}
