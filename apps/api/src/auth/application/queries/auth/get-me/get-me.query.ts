import { Query } from '@nestjs/cqrs';
import type { UserDto } from '@tfg/types';

export class GetMeQuery extends Query<UserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
