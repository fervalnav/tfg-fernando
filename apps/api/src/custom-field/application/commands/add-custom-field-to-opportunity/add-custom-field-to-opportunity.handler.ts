import { forwardRef, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityFinder } from '@/opportunity';
import { CustomFieldFromDefaultService } from '../../services/custom-field-from-default.service';
import { AddCustomFieldToOpportunityCommand } from './add-custom-field-to-opportunity.command';

@CommandHandler(AddCustomFieldToOpportunityCommand)
export class AddCustomFieldToOpportunityHandler implements ICommandHandler<AddCustomFieldToOpportunityCommand, void> {
  constructor(
    private readonly creator: CustomFieldFromDefaultService,
    @Inject(forwardRef(() => OpportunityFinder))
    private readonly opportunityFinder: OpportunityFinder,
  ) {}

  async execute(command: AddCustomFieldToOpportunityCommand): Promise<void> {
    await this.opportunityFinder.find(command.opportunityId, command.accountId);
    await this.creator.createOrGet(command.defaultCustomFieldId, command.opportunityId, command.accountId, command.id);
  }
}
