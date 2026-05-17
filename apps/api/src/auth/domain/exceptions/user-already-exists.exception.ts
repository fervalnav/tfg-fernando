import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class UserAlreadyExistsException extends DomainException {
  readonly code = 'USER_ALREADY_EXISTS';
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
