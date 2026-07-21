import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDefaultControlQuestionCommand } from './update-default-control-question.command';
import { DefaultControlQuestionRepository } from '../../../domain/default-control-question.repository';
import { DefaultControlQuestionNotFoundException } from '../../../domain/exceptions/default-control-question-not-found.exception';

@CommandHandler(UpdateDefaultControlQuestionCommand)
export class UpdateDefaultControlQuestionHandler implements ICommandHandler<UpdateDefaultControlQuestionCommand, void> {
  constructor(private readonly repo: DefaultControlQuestionRepository) {}

  async execute(command: UpdateDefaultControlQuestionCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId)
      throw new DefaultControlQuestionNotFoundException(command.id);

    entity.update({
      question: command.question,
      answerType: command.answerType,
      passConditionPrompt: command.passConditionPrompt,
    });
    await this.repo.save(entity);
  }
}
