import { forwardRef, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityFinder } from '@/opportunity';
import { SummaryFromTemplateService } from '../../services/summary-from-template.service';
import { AddSummaryToOpportunityCommand } from './add-summary-to-opportunity.command';

@CommandHandler(AddSummaryToOpportunityCommand)
export class AddSummaryToOpportunityHandler implements ICommandHandler<AddSummaryToOpportunityCommand, void> {
  constructor(
    private readonly creator: SummaryFromTemplateService,
    @Inject(forwardRef(() => OpportunityFinder))
    private readonly opportunityFinder: OpportunityFinder,
  ) {}

  async execute(command: AddSummaryToOpportunityCommand): Promise<void> {
    await this.opportunityFinder.find(command.opportunityId, command.accountId);
    await this.creator.createOrGet(command.summaryTemplateId, command.opportunityId, command.accountId, command.id);
  }
}
