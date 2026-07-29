import { Query } from '@nestjs/cqrs';
import type { SummaryDto } from '@tfg/types';

export class FindOpportunitySummariesQuery extends Query<SummaryDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
