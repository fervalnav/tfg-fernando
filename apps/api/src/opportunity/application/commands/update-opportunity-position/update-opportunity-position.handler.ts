import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOpportunityPositionCommand } from './update-opportunity-position.command';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../../domain/exceptions/opportunity-not-found.exception';

@CommandHandler(UpdateOpportunityPositionCommand)
export class UpdateOpportunityPositionHandler implements ICommandHandler<UpdateOpportunityPositionCommand, void> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(command: UpdateOpportunityPositionCommand): Promise<void> {
    const opportunity = await this.repo.findById(command.id, command.accountId);
    if (!opportunity) throw new OpportunityNotFoundException(command.id);

    opportunity.updatePosition(command.sortPoints, command.pipelineStatusId);

    await this.repo.save(opportunity);
  }
}
