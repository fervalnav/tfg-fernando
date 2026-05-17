import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class RefreshTokenInvalidException extends DomainException {
  readonly code = 'REFRESH_TOKEN_INVALID';
  constructor() {
    super('Refresh token is invalid or expired');
  }
}
