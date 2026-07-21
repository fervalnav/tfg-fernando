import type { SummaryTemplate } from './summary-template.entity';

export abstract class SummaryTemplateRepository {
  abstract findAllByAccountId(accountId: string, page: number, limit: number): Promise<SummaryTemplate[]>;
  abstract countByAccountId(accountId: string): Promise<number>;
  abstract findById(id: string): Promise<SummaryTemplate | null>;
  abstract save(entity: SummaryTemplate): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
