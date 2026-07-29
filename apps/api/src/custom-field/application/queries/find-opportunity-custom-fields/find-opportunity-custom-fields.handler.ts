import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { CustomFieldDto } from '@tfg/types';
import { CustomFieldRepository } from '../../../domain/custom-field.repository';
import { FindOpportunityCustomFieldsQuery } from './find-opportunity-custom-fields.query';
import { CustomFieldDto as CustomFieldResponseDto } from './custom-field.dto';

@QueryHandler(FindOpportunityCustomFieldsQuery)
export class FindOpportunityCustomFieldsHandler implements IQueryHandler<
  FindOpportunityCustomFieldsQuery,
  CustomFieldDto[]
> {
  constructor(private readonly repo: CustomFieldRepository) {}

  async execute(query: FindOpportunityCustomFieldsQuery): Promise<CustomFieldDto[]> {
    const items = await this.repo.findByOpportunityId(query.opportunityId, query.accountId);
    return items.map((item) => CustomFieldResponseDto.fromEntity(item));
  }
}
