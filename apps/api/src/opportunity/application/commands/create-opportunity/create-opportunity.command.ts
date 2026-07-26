import { Command } from '@nestjs/cqrs';

export class CreateOpportunityCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly amount: number | null,
    public readonly currency: string | null,
    public readonly pipelineId: string,
    public readonly pipelineStatusId: string,
    public readonly workflowId: string | null,
    public readonly dueDate: Date | null,
  ) {
    super();
  }
}
