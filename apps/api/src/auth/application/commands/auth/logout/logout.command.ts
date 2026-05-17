import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';

export class LogoutCommand extends Command<void> {
  constructor(
    public readonly cookies: Record<string, string> | undefined,
    public readonly res: Response,
  ) {
    super();
  }
}
