import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindMembersQuery } from './find-members.query';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import type { AccountMemberDto } from '@tfg/types';

@QueryHandler(FindMembersQuery)
export class FindMembersHandler implements IQueryHandler<FindMembersQuery, AccountMemberDto[]> {
  constructor(
    private readonly memberRepo: AccountMemberRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(query: FindMembersQuery): Promise<AccountMemberDto[]> {
    const members = await this.memberRepo.findAllByAccount(query.accountId);

    const userResults = await Promise.all(members.map((member) => this.userRepo.findById(member.userId)));

    return members.reduce<AccountMemberDto[]>((acc, member, i) => {
      const user = userResults[i];
      if (!user) return acc;
      acc.push({
        id: member.id,
        userId: member.userId,
        accountId: member.accountId,
        role: member.role,
        isDefault: member.isDefault,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
        },
      });
      return acc;
    }, []);
  }
}
