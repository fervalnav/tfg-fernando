import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, void> {
  constructor(private readonly sessionService: AuthSessionService) {}

  execute(command: RefreshTokenCommand): Promise<void> {
    return this.sessionService.refreshSession(command.cookies, command.res);
  }
}
