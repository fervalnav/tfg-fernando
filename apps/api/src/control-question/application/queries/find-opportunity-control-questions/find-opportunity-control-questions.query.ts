import { Query } from '@nestjs/cqrs';
import type { ControlQuestionDto } from '@tfg/types';

export class FindOpportunityControlQuestionsQuery extends Query<ControlQuestionDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
