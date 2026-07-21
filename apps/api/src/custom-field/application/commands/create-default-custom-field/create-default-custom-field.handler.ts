import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDefaultCustomFieldCommand } from './create-default-custom-field.command';
import { DefaultCustomFieldRepository } from '../../../domain/default-custom-field.repository';
import { DefaultCustomField } from '../../../domain/default-custom-field.entity';

@CommandHandler(CreateDefaultCustomFieldCommand)
export class CreateDefaultCustomFieldHandler implements ICommandHandler<CreateDefaultCustomFieldCommand, void> {
  constructor(private readonly repo: DefaultCustomFieldRepository) {}

  async execute(command: CreateDefaultCustomFieldCommand): Promise<void> {
    const entity = DefaultCustomField.create({
      id: command.id,
      accountId: command.accountId,
      name: command.name,
      description: command.description ?? undefined,
      type: command.type,
      classifiers: command.classifiers,
      canSelectMultiple: command.canSelectMultiple,
      automatic: command.automatic,
      aiPrompt: command.aiPrompt ?? undefined,
    });
    await this.repo.save(entity);
  }
}
