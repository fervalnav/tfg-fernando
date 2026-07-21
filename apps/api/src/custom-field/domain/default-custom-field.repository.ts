import type { DefaultCustomField } from './default-custom-field.entity';

export abstract class DefaultCustomFieldRepository {
  abstract findAllByAccountId(accountId: string, page: number, limit: number): Promise<DefaultCustomField[]>;
  abstract countByAccountId(accountId: string): Promise<number>;
  abstract findById(id: string): Promise<DefaultCustomField | null>;
  abstract save(entity: DefaultCustomField): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
