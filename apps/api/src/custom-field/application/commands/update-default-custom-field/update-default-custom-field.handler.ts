import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDefaultCustomFieldCommand } from './update-default-custom-field.command';
import { DefaultCustomFieldRepository } from '../../../domain/default-custom-field.repository';
import { DefaultCustomFieldNotFoundException } from '../../../domain/exceptions/default-custom-field-not-found.exception';

@CommandHandler(UpdateDefaultCustomFieldCommand)
export class UpdateDefaultCustomFieldHandler implements ICommandHandler<UpdateDefaultCustomFieldCommand, void> {
  constructor(private readonly repo: DefaultCustomFieldRepository) {}

  async execute(command: UpdateDefaultCustomFieldCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId) throw new DefaultCustomFieldNotFoundException(command.id);

    entity.update({
      name: command.name,
      description: command.description,
      type: command.type,
      classifiers: command.classifiers,
      canSelectMultiple: command.canSelectMultiple,
      automatic: command.automatic,
      aiPrompt: command.aiPrompt,
    });
    await this.repo.save(entity);
  }
}
