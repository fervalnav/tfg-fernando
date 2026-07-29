import type { CustomField } from './custom-field.entity';

export abstract class CustomFieldRepository {
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<CustomField[]>;
  abstract findByOpportunityAndDefaultId(
    opportunityId: string,
    defaultCustomFieldId: string,
  ): Promise<CustomField | null>;
  abstract findById(id: string): Promise<CustomField | null>;
  abstract save(entity: CustomField): Promise<void>;
  abstract saveMany(entities: CustomField[]): Promise<void>;
}
