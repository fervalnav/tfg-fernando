import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { SummaryRepository } from '../../../domain/summary.repository';
import { SummaryNotFoundException } from '../../../domain/exceptions/summary-not-found.exception';
import { SummaryAiGenerationRequestedEvent } from '../../events/summary-ai.events';
import { RequestSummaryAiGenerationCommand } from './request-summary-ai-generation.command';

@CommandHandler(RequestSummaryAiGenerationCommand)
export class RequestSummaryAiGenerationHandler implements ICommandHandler<RequestSummaryAiGenerationCommand, void> {
  constructor(
    private readonly summaries: SummaryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestSummaryAiGenerationCommand): Promise<void> {
    const summary = await this.summaries.findById(command.summaryId);
    if (!summary || summary.accountId !== command.accountId || summary.opportunityId !== command.opportunityId) {
      throw new SummaryNotFoundException(command.summaryId);
    }
    if (!summary.requestAiGeneration()) return;
    await this.summaries.save(summary);
    this.eventBus.publish(
      new SummaryAiGenerationRequestedEvent(command.opportunityId, command.accountId, command.summaryId),
    );
  }
}
