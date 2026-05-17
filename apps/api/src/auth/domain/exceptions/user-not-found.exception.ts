import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class UserNotFoundException extends DomainException {
  readonly code = 'USER_NOT_FOUND';
  constructor(id: string) {
    super(`User with id ${id} not found`);
  }
}
