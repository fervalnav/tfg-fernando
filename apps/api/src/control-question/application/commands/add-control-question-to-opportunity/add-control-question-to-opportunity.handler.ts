import { forwardRef, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { OpportunityFinder } from '@/opportunity';
import { ControlQuestionFromDefaultService } from '../../services/control-question-from-default.service';
import { AddControlQuestionToOpportunityCommand } from './add-control-question-to-opportunity.command';

@CommandHandler(AddControlQuestionToOpportunityCommand)
export class AddControlQuestionToOpportunityHandler implements ICommandHandler<
  AddControlQuestionToOpportunityCommand,
  void
> {
  constructor(
    private readonly creator: ControlQuestionFromDefaultService,
    @Inject(forwardRef(() => OpportunityFinder))
    private readonly opportunityFinder: OpportunityFinder,
  ) {}

  async execute(command: AddControlQuestionToOpportunityCommand): Promise<void> {
    await this.opportunityFinder.find(command.opportunityId, command.accountId);
    await this.creator.createOrGet(
      command.defaultControlQuestionId,
      command.opportunityId,
      command.accountId,
      command.id,
    );
  }
}
