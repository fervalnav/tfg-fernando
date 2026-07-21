import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDefaultControlQuestionCommand } from './create-default-control-question.command';
import { DefaultControlQuestionRepository } from '../../../domain/default-control-question.repository';
import { DefaultControlQuestion } from '../../../domain/default-control-question.entity';

@CommandHandler(CreateDefaultControlQuestionCommand)
export class CreateDefaultControlQuestionHandler implements ICommandHandler<CreateDefaultControlQuestionCommand, void> {
  constructor(private readonly repo: DefaultControlQuestionRepository) {}

  async execute(command: CreateDefaultControlQuestionCommand): Promise<void> {
    const entity = DefaultControlQuestion.create({
      id: command.id,
      accountId: command.accountId,
      question: command.question,
      answerType: command.answerType,
      passConditionPrompt: command.passConditionPrompt ?? undefined,
    });
    await this.repo.save(entity);
  }
}
