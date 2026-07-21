import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDefaultCustomFieldCommand } from './delete-default-custom-field.command';
import { DefaultCustomFieldRepository } from '../../../domain/default-custom-field.repository';
import { DefaultCustomFieldNotFoundException } from '../../../domain/exceptions/default-custom-field-not-found.exception';

@CommandHandler(DeleteDefaultCustomFieldCommand)
export class DeleteDefaultCustomFieldHandler implements ICommandHandler<DeleteDefaultCustomFieldCommand, void> {
  constructor(private readonly repo: DefaultCustomFieldRepository) {}

  async execute(command: DeleteDefaultCustomFieldCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId) throw new DefaultCustomFieldNotFoundException(command.id);

    await this.repo.delete(command.id);
  }
}
