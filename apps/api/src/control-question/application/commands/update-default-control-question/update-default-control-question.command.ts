import { Command } from '@nestjs/cqrs';
import type { AnswerType } from '../../../domain/default-control-question.entity';

export class UpdateDefaultControlQuestionCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly question: string | undefined,
    public readonly answerType: AnswerType | undefined,
    public readonly passConditionPrompt: string | null | undefined,
  ) {
    super();
  }
}
