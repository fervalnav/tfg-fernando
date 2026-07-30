import { CommandBus, EventBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityQualificationGenerationRequestedEvent } from '@/opportunity';
import { SummaryRepository } from '../../domain/summary.repository';
import { RequestSummaryAiGenerationCommand } from '../commands/request-summary-ai-generation';

@EventsHandler(OpportunityQualificationGenerationRequestedEvent)
export class OpportunitySummaryGenerationRequestedHandler implements IEventHandler<OpportunityQualificationGenerationRequestedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly summaries: SummaryRepository,
  ) {}

  async handle(event: OpportunityQualificationGenerationRequestedEvent): Promise<void> {
    if (event.targetType !== 'summary') return;
    try {
      await this.commandBus.execute(
        new RequestSummaryAiGenerationCommand(event.opportunityId, event.accountId, event.targetId),
      );
    } catch (error) {
      const summary = await this.summaries.findById(event.targetId);
      if (!summary || summary.accountId !== event.accountId || summary.opportunityId !== event.opportunityId) return;
      summary.failAiGeneration(error instanceof Error ? error.message : 'No se pudo solicitar la generación');
      await this.summaries.save(summary);
      await this.eventBus.publishAll(summary.pullDomainEvents());
    }
  }
}
