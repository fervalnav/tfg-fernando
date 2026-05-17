import { Query } from '@nestjs/cqrs';
import type { MyAccountDto } from '@tfg/types';

export class FindMyAccountsQuery extends Query<MyAccountDto[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
