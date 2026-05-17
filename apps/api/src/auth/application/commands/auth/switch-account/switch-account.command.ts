import { Command } from '@nestjs/cqrs';
import type { Response } from 'express';

export class SwitchAccountCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly accountId: string,
    public readonly cookies: Record<string, string> | undefined,
    public readonly res: Response,
  ) {
    super();
  }
}
