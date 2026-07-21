import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { PaginatedResult, DefaultCustomFieldDto as IDefaultCustomFieldDto } from '@tfg/types';
import { FindDefaultCustomFieldsQuery } from './find-default-custom-fields.query';
import { DefaultCustomFieldRepository } from '../../../domain/default-custom-field.repository';
import { DefaultCustomFieldDto } from './default-custom-field.dto';

const MAX_LIMIT = 20;

@QueryHandler(FindDefaultCustomFieldsQuery)
export class FindDefaultCustomFieldsHandler implements IQueryHandler<
  FindDefaultCustomFieldsQuery,
  PaginatedResult<IDefaultCustomFieldDto>
> {
  constructor(private readonly repo: DefaultCustomFieldRepository) {}

  async execute(query: FindDefaultCustomFieldsQuery): Promise<PaginatedResult<IDefaultCustomFieldDto>> {
    const limit = Math.min(query.limit, MAX_LIMIT);
    const [items, total] = await Promise.all([
      this.repo.findAllByAccountId(query.accountId, query.page, limit),
      this.repo.countByAccountId(query.accountId),
    ]);
    return {
      items: items.map((e) => DefaultCustomFieldDto.fromEntity(e)),
      total,
      page: query.page,
      limit,
    };
  }
}
