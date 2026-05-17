import { Query } from '@nestjs/cqrs';
import type { AccountMemberDto } from '@tfg/types';

export class FindMembersQuery extends Query<AccountMemberDto[]> {
  constructor(public readonly accountId: string) {
    super();
  }
}
