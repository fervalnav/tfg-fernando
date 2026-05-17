import type { AccountMember } from '../entities/account-member.entity';

export abstract class AccountMemberRepository {
  abstract save(member: AccountMember): Promise<void>;
  abstract findByUserAndAccount(userId: string, accountId: string): Promise<AccountMember | null>;
  abstract findDefaultByUser(userId: string): Promise<AccountMember | null>;
  abstract findAllByAccount(accountId: string): Promise<AccountMember[]>;
  abstract findAllByUser(userId: string): Promise<AccountMember[]>;
  abstract delete(id: string): Promise<void>;
  abstract clearDefaultForUser(userId: string): Promise<void>;
}
