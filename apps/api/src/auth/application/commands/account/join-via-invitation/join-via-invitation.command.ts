import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';
import type { AuthResponseDto } from '@tfg/types';

export class JoinViaInvitationCommand extends Command<AuthResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly token: string,
    public readonly res: Response,
  ) {
    super();
  }
}
