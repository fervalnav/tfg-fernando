import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class AccountMemberAlreadyExistsException extends DomainException {
  readonly code = 'ACCOUNT_MEMBER_ALREADY_EXISTS';
  constructor(email: string, accountId: string) {
    super(`User ${email} is already a member of account ${accountId}`);
  }
}
