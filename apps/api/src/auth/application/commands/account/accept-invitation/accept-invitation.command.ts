import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';
import type { AuthResponseDto } from '@tfg/types';

export class AcceptInvitationCommand extends Command<AuthResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly token: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly password: string,
    public readonly res: Response,
  ) {
    super();
  }
}
