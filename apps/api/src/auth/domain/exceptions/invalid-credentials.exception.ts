import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  readonly code = 'INVALID_CREDENTIALS';
  constructor() {
    super('Invalid email or password');
  }
}
