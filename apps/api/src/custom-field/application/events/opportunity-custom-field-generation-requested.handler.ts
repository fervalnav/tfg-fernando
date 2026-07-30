import { CommandBus, EventBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import {
  OpportunityQualificationGenerationFailedEvent,
  OpportunityQualificationGenerationRequestedEvent,
} from '@/opportunity';
import { RequestCustomFieldAiGenerationCommand } from '../commands/request-custom-field-ai-generation';

@EventsHandler(OpportunityQualificationGenerationRequestedEvent)
export class OpportunityCustomFieldGenerationRequestedHandler implements IEventHandler<OpportunityQualificationGenerationRequestedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: OpportunityQualificationGenerationRequestedEvent): Promise<void> {
    if (event.targetType !== 'custom_field') return;
    try {
      await this.commandBus.execute(
        new RequestCustomFieldAiGenerationCommand(event.opportunityId, event.accountId, event.targetId),
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
