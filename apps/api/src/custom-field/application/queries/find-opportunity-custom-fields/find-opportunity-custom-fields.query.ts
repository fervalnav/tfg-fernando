import { Query } from '@nestjs/cqrs';
import type { CustomFieldDto } from '@tfg/types';

export class FindOpportunityCustomFieldsQuery extends Query<CustomFieldDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
