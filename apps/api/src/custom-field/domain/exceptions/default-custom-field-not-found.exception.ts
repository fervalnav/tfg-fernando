import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class DefaultCustomFieldNotFoundException extends DomainException {
  readonly code = 'DEFAULT_CUSTOM_FIELD_NOT_FOUND';
  constructor(id: string) {
    super(`Default custom field with id ${id} not found`);
  }
}
