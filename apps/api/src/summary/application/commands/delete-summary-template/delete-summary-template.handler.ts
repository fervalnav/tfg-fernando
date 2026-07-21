import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSummaryTemplateCommand } from './delete-summary-template.command';
import { SummaryTemplateRepository } from '../../../domain/summary-template.repository';
import { SummaryTemplateNotFoundException } from '../../../domain/exceptions/summary-template-not-found.exception';

@CommandHandler(DeleteSummaryTemplateCommand)
export class DeleteSummaryTemplateHandler implements ICommandHandler<DeleteSummaryTemplateCommand, void> {
  constructor(private readonly repo: SummaryTemplateRepository) {}

  async execute(command: DeleteSummaryTemplateCommand): Promise<void> {
    const entity = await this.repo.findById(command.id);
    if (!entity || entity.accountId !== command.accountId) throw new SummaryTemplateNotFoundException(command.id);

    await this.repo.delete(command.id);
  }
}
