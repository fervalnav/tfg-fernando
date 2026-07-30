import { CommandBus, EventBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import {
  OpportunityQualificationGenerationFailedEvent,
  OpportunityQualificationGenerationRequestedEvent,
} from '@/opportunity';
import { RequestSummaryAiGenerationCommand } from '../commands/request-summary-ai-generation';

@EventsHandler(OpportunityQualificationGenerationRequestedEvent)
export class OpportunitySummaryGenerationRequestedHandler implements IEventHandler<OpportunityQualificationGenerationRequestedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: OpportunityQualificationGenerationRequestedEvent): Promise<void> {
    if (event.targetType !== 'summary') return;
    try {
      await this.commandBus.execute(
        new RequestSummaryAiGenerationCommand(event.opportunityId, event.accountId, event.targetId),
      );
    } catch (error) {
      this.eventBus.publish(
        new OpportunityQualificationGenerationFailedEvent(
          event.opportunityId,
          event.accountId,
          event.targetType,
          event.targetId,
          error instanceof Error ? error.message : 'No se pudo solicitar la generación',
        ),
      );
    }
  }
}
