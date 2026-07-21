import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSummaryTemplateCommand } from './create-summary-template.command';
import { SummaryTemplateRepository } from '../../../domain/summary-template.repository';
import { SummaryTemplate } from '../../../domain/summary-template.entity';

@CommandHandler(CreateSummaryTemplateCommand)
export class CreateSummaryTemplateHandler implements ICommandHandler<CreateSummaryTemplateCommand, void> {
  constructor(private readonly repo: SummaryTemplateRepository) {}

  async execute(command: CreateSummaryTemplateCommand): Promise<void> {
    const entity = SummaryTemplate.create({
      id: command.id,
      accountId: command.accountId,
      name: command.name,
      prompt: command.prompt,
    });
    await this.repo.save(entity);
  }
}
