import { Command } from '@nestjs/cqrs';
import type { FinalOutcomeType } from '../../../domain/value-objects/final-outcome-type.vo';

export class TransitionOpportunityStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly pipelineStatusId: string,
    public readonly finalOutcomeType: FinalOutcomeType | null,
    public readonly sortPoints: number | undefined,
  ) {
    super();
  }
}
