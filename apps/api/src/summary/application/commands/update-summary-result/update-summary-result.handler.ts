import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityQualificationUpdatedEvent } from '@/opportunity';
import { SummaryRepository } from '../../../domain/summary.repository';
import { SummaryNotFoundException } from '../../../domain/exceptions/summary-not-found.exception';
import { UpdateSummaryResultCommand } from './update-summary-result.command';

@CommandHandler(UpdateSummaryResultCommand)
export class UpdateSummaryResultHandler implements ICommandHandler<UpdateSummaryResultCommand, void> {
  constructor(
    private readonly summaries: SummaryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateSummaryResultCommand): Promise<void> {
    const summary = await this.summaries.findById(command.summaryId);
    if (!summary || summary.accountId !== command.accountId || summary.opportunityId !== command.opportunityId) {
      throw new SummaryNotFoundException(command.summaryId);
    }
    summary.updateResult(command.result);
    await this.summaries.save(summary);
    this.eventBus.publish(
      new OpportunityQualificationUpdatedEvent(command.opportunityId, command.accountId, 'summary', summary.id),
    );
  }
}
