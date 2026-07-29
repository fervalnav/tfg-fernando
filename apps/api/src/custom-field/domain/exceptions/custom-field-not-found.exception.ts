import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class CustomFieldNotFoundException extends DomainException {
  readonly code = 'CUSTOM_FIELD_NOT_FOUND';
  constructor(id: string) {
    super(`Custom field with id ${id} not found`);
  }
}
