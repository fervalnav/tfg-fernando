import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class InvitationTokenInvalidException extends DomainException {
  readonly code = 'INVITATION_TOKEN_INVALID';
  constructor() {
    super('Invitation token is invalid, expired, or already used');
  }
}
