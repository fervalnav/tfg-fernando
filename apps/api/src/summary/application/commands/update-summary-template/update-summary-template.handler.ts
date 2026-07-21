import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSummaryTemplateCommand } from './update-summary-template.command';
import { SummaryTemplateRepository } from '../../../domain/summary-template.repository';
import { SummaryTemplateNotFoundException } from '../../../domain/exceptions/summary-template-not-found.exception';

@CommandHandler(UpdateSummaryTemplateCommand)
export class UpdateSummaryTemplateHandler implements ICommandHandler<UpdateSummaryTemplateCommand, void> {
  constructor(private readonly repo: SummaryTemplateRepository) {}

  async execute(command: UpdateSummaryTemplateCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId) throw new SummaryTemplateNotFoundException(command.id);

    entity.update({ name: command.name, prompt: command.prompt });
    await this.repo.save(entity);
  }
}
