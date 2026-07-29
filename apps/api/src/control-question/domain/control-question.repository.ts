import type { ControlQuestion } from './control-question.entity';

export abstract class ControlQuestionRepository {
  abstract findByOpportunityId(opportunityId: string, accountId: string): Promise<ControlQuestion[]>;
  abstract findByOpportunityAndDefaultId(
    opportunityId: string,
    defaultControlQuestionId: string,
  ): Promise<ControlQuestion | null>;
  abstract findById(id: string): Promise<ControlQuestion | null>;
  abstract save(entity: ControlQuestion): Promise<void>;
  abstract saveMany(entities: ControlQuestion[]): Promise<void>;
}
