import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { CustomFieldRepository } from '../../../domain/custom-field.repository';
import { CustomFieldNotFoundException } from '../../../domain/exceptions/custom-field-not-found.exception';
import { CustomFieldAiGenerationUnavailableException } from '../../../domain/exceptions/custom-field-ai-generation-unavailable.exception';
import { CustomFieldAiGenerationRequestedEvent } from '../../events/custom-field-ai.events';
import { RequestCustomFieldAiGenerationCommand } from './request-custom-field-ai-generation.command';

@CommandHandler(RequestCustomFieldAiGenerationCommand)
export class RequestCustomFieldAiGenerationHandler implements ICommandHandler<
  RequestCustomFieldAiGenerationCommand,
  void
> {
  constructor(
    private readonly fields: CustomFieldRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestCustomFieldAiGenerationCommand): Promise<void> {
    const field = await this.fields.findById(command.customFieldId);
    if (!field || field.accountId !== command.accountId || field.opportunityId !== command.opportunityId) {
      throw new CustomFieldNotFoundException(command.customFieldId);
    }
    const configuration = field.toPrimitives();
    if (!configuration.automatic || !configuration.aiPrompt) {
      throw new CustomFieldAiGenerationUnavailableException(command.customFieldId);
    }
    if (!field.requestAiGeneration()) return;
    await this.fields.save(field);
    this.eventBus.publish(
      new CustomFieldAiGenerationRequestedEvent(command.opportunityId, command.accountId, command.customFieldId),
    );
  }
}
