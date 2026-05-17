import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindMyAccountsQuery } from './find-my-accounts.query';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { AccountRepository } from '../../../../domain/repositories/account.repository';
import type { MyAccountDto } from '@tfg/types';

@QueryHandler(FindMyAccountsQuery)
export class FindMyAccountsHandler implements IQueryHandler<FindMyAccountsQuery, MyAccountDto[]> {
  constructor(
    private readonly memberRepo: AccountMemberRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  async execute(query: FindMyAccountsQuery): Promise<MyAccountDto[]> {
    const members = await this.memberRepo.findAllByUser(query.userId);

    const accounts = await Promise.all(members.map((m) => this.accountRepo.findById(m.accountId)));

    return members.reduce<MyAccountDto[]>((acc, member, i) => {
      const account = accounts[i];
      if (!account) return acc;
      acc.push({
        id: account.id,
        name: account.name,
        role: member.role,
        isDefault: member.isDefault,
      });
      return acc;
    }, []);
  }
}
