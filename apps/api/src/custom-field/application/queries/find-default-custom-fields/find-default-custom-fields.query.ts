import { Query } from '@nestjs/cqrs';
import type { PaginatedResult, DefaultCustomFieldDto } from '@tfg/types';

export class FindDefaultCustomFieldsQuery extends Query<PaginatedResult<DefaultCustomFieldDto>> {
  constructor(
    public readonly accountId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {
    super();
  }
}
