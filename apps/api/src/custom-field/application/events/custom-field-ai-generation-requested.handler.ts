import { CommandBus, EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { GenerateCustomFieldValueWithAiCommand } from '../commands/generate-custom-field-value-with-ai';
import { CustomFieldAiGenerationRequestedEvent } from './custom-field-ai.events';

@EventsHandler(CustomFieldAiGenerationRequestedEvent)
export class CustomFieldAiGenerationRequestedHandler implements IEventHandler<CustomFieldAiGenerationRequestedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: CustomFieldAiGenerationRequestedEvent): Promise<void> {
    await this.commandBus.execute(
      new GenerateCustomFieldValueWithAiCommand(event.opportunityId, event.accountId, event.customFieldId),
    );
  }
}
