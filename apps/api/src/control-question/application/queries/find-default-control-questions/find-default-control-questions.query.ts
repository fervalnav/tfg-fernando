import { Query } from '@nestjs/cqrs';
import type { PaginatedResult, DefaultControlQuestionDto } from '@tfg/types';

export class FindDefaultControlQuestionsQuery extends Query<PaginatedResult<DefaultControlQuestionDto>> {
  constructor(
    public readonly accountId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {
    super();
  }
}
