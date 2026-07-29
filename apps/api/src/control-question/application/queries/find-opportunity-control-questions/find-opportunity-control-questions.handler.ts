import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { ControlQuestionDto as IControlQuestionDto } from '@tfg/types';
import { ControlQuestionRepository } from '../../../domain/control-question.repository';
import { FindOpportunityControlQuestionsQuery } from './find-opportunity-control-questions.query';
import { ControlQuestionDto } from './control-question.dto';

@QueryHandler(FindOpportunityControlQuestionsQuery)
export class FindOpportunityControlQuestionsHandler implements IQueryHandler<
  FindOpportunityControlQuestionsQuery,
  IControlQuestionDto[]
> {
  constructor(private readonly repo: ControlQuestionRepository) {}

  async execute(query: FindOpportunityControlQuestionsQuery): Promise<IControlQuestionDto[]> {
    const items = await this.repo.findByOpportunityId(query.opportunityId, query.accountId);
    return items.map((item) => ControlQuestionDto.fromEntity(item));
  }
}
