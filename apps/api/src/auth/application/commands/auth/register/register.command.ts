import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';
import type { AuthResponseDto } from '@tfg/types';

export class RegisterCommand extends Command<AuthResponseDto> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly accountName: string,
    public readonly res: Response,
  ) {
    super();
  }
}
