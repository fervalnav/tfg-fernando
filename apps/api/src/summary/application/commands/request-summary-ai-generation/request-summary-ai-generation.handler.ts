import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityQualificationActionLifecycleService } from '@/opportunity';
import { SummaryRepository } from '../../../domain/summary.repository';
import { SummaryNotFoundException } from '../../../domain/exceptions/summary-not-found.exception';
import { RequestSummaryAiGenerationCommand } from './request-summary-ai-generation.command';

@CommandHandler(RequestSummaryAiGenerationCommand)
export class RequestSummaryAiGenerationHandler implements ICommandHandler<RequestSummaryAiGenerationCommand, void> {
  constructor(
    private readonly summaries: SummaryRepository,
    private readonly eventBus: EventBus,
    private readonly actionLifecycle: OpportunityQualificationActionLifecycleService,
  ) {}

  async execute(command: RequestSummaryAiGenerationCommand): Promise<void> {
    const summary = await this.summaries.findById(command.summaryId);
    if (!summary || summary.accountId !== command.accountId || summary.opportunityId !== command.opportunityId) {
      throw new SummaryNotFoundException(command.summaryId);
    }
    if (!summary.requestAiGeneration()) return;
    await this.summaries.save(summary);
    await this.actionLifecycle.start(command.opportunityId, command.accountId, 'summary', command.summaryId);
    await this.eventBus.publishAll(summary.pullDomainEvents());
  }
}
