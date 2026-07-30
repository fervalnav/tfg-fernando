import { CommandBus, EventBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { OpportunityQualificationGenerationRequestedEvent } from '@/opportunity';
import { CustomFieldRepository } from '../../domain/custom-field.repository';
import { RequestCustomFieldAiGenerationCommand } from '../commands/request-custom-field-ai-generation';

@EventsHandler(OpportunityQualificationGenerationRequestedEvent)
export class OpportunityCustomFieldGenerationRequestedHandler implements IEventHandler<OpportunityQualificationGenerationRequestedEvent> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly fields: CustomFieldRepository,
  ) {}

  async handle(event: OpportunityQualificationGenerationRequestedEvent): Promise<void> {
    if (event.targetType !== 'custom_field') return;
    try {
      await this.commandBus.execute(
        new RequestCustomFieldAiGenerationCommand(event.opportunityId, event.accountId, event.targetId),
      );
    } catch (error) {
      const field = await this.fields.findById(event.targetId);
      if (!field || field.accountId !== event.accountId || field.opportunityId !== event.opportunityId) return;
      field.failAiGeneration(error instanceof Error ? error.message : 'No se pudo solicitar la generación');
      await this.fields.save(field);
      await this.eventBus.publishAll(field.pullDomainEvents());
    }
  }
}
