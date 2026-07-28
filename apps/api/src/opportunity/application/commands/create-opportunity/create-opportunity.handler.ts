import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateOpportunityCommand } from './create-opportunity.command';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { Opportunity } from '../../../domain/opportunity.entity';
import { OpportunityCreatedEvent } from '../../workflow/opportunity-workflow.events';

@CommandHandler(CreateOpportunityCommand)
export class CreateOpportunityHandler implements ICommandHandler<CreateOpportunityCommand, void> {
  constructor(
    private readonly repo: OpportunityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOpportunityCommand): Promise<void> {
    const count = await this.repo.countInStatus(command.pipelineId, command.pipelineStatusId);
    const sortPoints = (count + 1) * 1000;

    const opportunity = Opportunity.create({
      id: command.id,
      accountId: command.accountId,
      title: command.title,
      description: command.description,
      amount: command.amount,
      currency: command.currency,
      pipelineId: command.pipelineId,
      pipelineStatusId: command.pipelineStatusId,
      sortPoints,
      workflowId: null,
      dueDate: command.dueDate,
    });

    await this.repo.save(opportunity);
    this.eventBus.publish(new OpportunityCreatedEvent(command.id, command.accountId, command.workflowId));
  }
}
