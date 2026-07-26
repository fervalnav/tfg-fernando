import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransitionOpportunityStatusCommand } from './transition-opportunity-status.command';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../../domain/exceptions/opportunity-not-found.exception';

@CommandHandler(TransitionOpportunityStatusCommand)
export class TransitionOpportunityStatusHandler implements ICommandHandler<TransitionOpportunityStatusCommand, void> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(command: TransitionOpportunityStatusCommand): Promise<void> {
    const opportunity = await this.repo.findById(command.id, command.accountId);
    if (!opportunity) throw new OpportunityNotFoundException(command.id);

    opportunity.transitionStatus(command.pipelineStatusId, command.finalOutcomeType, command.sortPoints);

    await this.repo.save(opportunity);
  }
}
