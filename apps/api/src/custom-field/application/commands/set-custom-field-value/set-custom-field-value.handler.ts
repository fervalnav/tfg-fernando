import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityQualificationUpdatedEvent } from '@/opportunity';
import { CustomFieldRepository } from '../../../domain/custom-field.repository';
import { CustomFieldNotFoundException } from '../../../domain/exceptions/custom-field-not-found.exception';
import { SetCustomFieldValueCommand } from './set-custom-field-value.command';

@CommandHandler(SetCustomFieldValueCommand)
export class SetCustomFieldValueHandler implements ICommandHandler<SetCustomFieldValueCommand, void> {
  constructor(
    private readonly instances: CustomFieldRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SetCustomFieldValueCommand): Promise<void> {
    const instance = await this.instances.findById(command.customFieldId);
    if (!instance || instance.accountId !== command.accountId || instance.opportunityId !== command.opportunityId) {
      throw new CustomFieldNotFoundException(command.customFieldId);
    }
    instance.setValue(command.value);
    await this.instances.save(instance);
    this.eventBus.publish(
      new OpportunityQualificationUpdatedEvent(command.opportunityId, command.accountId, 'custom_field', instance.id),
    );
  }
}
