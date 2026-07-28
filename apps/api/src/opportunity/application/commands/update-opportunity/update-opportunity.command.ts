import { Command } from '@nestjs/cqrs';

export class UpdateOpportunityCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly title: string | undefined,
    public readonly description: string | null | undefined,
    public readonly amount: number | null | undefined,
    public readonly currency: string | null | undefined,
    public readonly dueDate: Date | null | undefined,
    public readonly responsibleUserIds: string[] | undefined,
    public readonly responsibleTeamIds: string[] | undefined,
  ) {
    super();
  }
}
