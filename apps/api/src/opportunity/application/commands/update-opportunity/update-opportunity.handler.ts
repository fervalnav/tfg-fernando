import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOpportunityCommand } from './update-opportunity.command';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../../domain/exceptions/opportunity-not-found.exception';

@CommandHandler(UpdateOpportunityCommand)
export class UpdateOpportunityHandler implements ICommandHandler<UpdateOpportunityCommand, void> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(command: UpdateOpportunityCommand): Promise<void> {
    const opportunity = await this.repo.findById(command.id, command.accountId);
    if (!opportunity) throw new OpportunityNotFoundException(command.id);

    opportunity.update({
      title: command.title,
      description: command.description,
      amount: command.amount,
      currency: command.currency,
      dueDate: command.dueDate,
      responsibleUserIds: command.responsibleUserIds,
      responsibleTeamIds: command.responsibleTeamIds,
    });

    await this.repo.save(opportunity);
  }
}
