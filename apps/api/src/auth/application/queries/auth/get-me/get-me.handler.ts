import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from './get-me.query';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../../../domain/exceptions/user-not-found.exception';
import type { UserDto } from '@tfg/types';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, UserDto> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: GetMeQuery): Promise<UserDto> {
    const user = await this.userRepo.findById(query.userId);
    if (!user) throw new UserNotFoundException(query.userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
