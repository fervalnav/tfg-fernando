import type { Summary } from './summary.entity';

export abstract class SummaryRepository {
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<Summary[]>;
  abstract findByOpportunityAndTemplateId(opportunityId: string, summaryTemplateId: string): Promise<Summary | null>;
  abstract findById(id: string): Promise<Summary | null>;
  abstract save(entity: Summary): Promise<void>;
  abstract saveMany(entities: Summary[]): Promise<void>;
}
