import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDefaultControlQuestionCommand } from './delete-default-control-question.command';
import { DefaultControlQuestionRepository } from '../../../domain/default-control-question.repository';
import { DefaultControlQuestionNotFoundException } from '../../../domain/exceptions/default-control-question-not-found.exception';

@CommandHandler(DeleteDefaultControlQuestionCommand)
export class DeleteDefaultControlQuestionHandler implements ICommandHandler<DeleteDefaultControlQuestionCommand, void> {
  constructor(private readonly repo: DefaultControlQuestionRepository) {}

  async execute(command: DeleteDefaultControlQuestionCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId)
      throw new DefaultControlQuestionNotFoundException(command.id);

    await this.repo.delete(command.id);
  }
}
