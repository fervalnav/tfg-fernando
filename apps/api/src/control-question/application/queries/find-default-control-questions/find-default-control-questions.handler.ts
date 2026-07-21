import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { PaginatedResult, DefaultControlQuestionDto as IDefaultControlQuestionDto } from '@tfg/types';
import { FindDefaultControlQuestionsQuery } from './find-default-control-questions.query';
import { DefaultControlQuestionRepository } from '../../../domain/default-control-question.repository';
import { DefaultControlQuestionDto } from './default-control-question.dto';

const MAX_LIMIT = 20;

@QueryHandler(FindDefaultControlQuestionsQuery)
export class FindDefaultControlQuestionsHandler implements IQueryHandler<
  FindDefaultControlQuestionsQuery,
  PaginatedResult<IDefaultControlQuestionDto>
> {
  constructor(private readonly repo: DefaultControlQuestionRepository) {}

  async execute(query: FindDefaultControlQuestionsQuery): Promise<PaginatedResult<IDefaultControlQuestionDto>> {
    const limit = Math.min(query.limit, MAX_LIMIT);
    const [items, total] = await Promise.all([
      this.repo.findAllByAccountId(query.accountId, query.page, limit),
      this.repo.countByAccountId(query.accountId),
    ]);
    return {
      items: items.map((e) => DefaultControlQuestionDto.fromEntity(e)),
      total,
      page: query.page,
      limit,
    };
  }
}
