import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class AccountMemberNotFoundException extends DomainException {
  readonly code = 'ACCOUNT_MEMBER_NOT_FOUND';
  constructor(userId: string, accountId: string) {
    super(`Member userId=${userId} not found in account ${accountId}`);
  }
}
