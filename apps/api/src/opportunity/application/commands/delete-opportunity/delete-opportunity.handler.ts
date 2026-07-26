import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteOpportunityCommand } from './delete-opportunity.command';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../../domain/exceptions/opportunity-not-found.exception';

@CommandHandler(DeleteOpportunityCommand)
export class DeleteOpportunityHandler implements ICommandHandler<DeleteOpportunityCommand, void> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(command: DeleteOpportunityCommand): Promise<void> {
    const opportunity = await this.repo.findById(command.id, command.accountId);
    if (!opportunity) throw new OpportunityNotFoundException(command.id);

    await this.repo.delete(command.id, command.accountId);
  }
}
