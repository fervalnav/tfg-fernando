import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';
import type { User } from '../../../../domain/entities/user.entity';
import type { AuthResponseDto } from '@tfg/types';

export class LoginCommand extends Command<AuthResponseDto> {
  constructor(
    public readonly user: User,
    public readonly res: Response,
  ) {
    super();
  }
}
