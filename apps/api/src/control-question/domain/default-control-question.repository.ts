import type { DefaultControlQuestion } from './default-control-question.entity';

export abstract class DefaultControlQuestionRepository {
  abstract findAllByAccountId(accountId: string, page: number, limit: number): Promise<DefaultControlQuestion[]>;
  abstract countByAccountId(accountId: string): Promise<number>;
  abstract findById(id: string): Promise<DefaultControlQuestion | null>;
  abstract save(entity: DefaultControlQuestion): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
