import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly sessionService: AuthSessionService) {}

  execute(command: LogoutCommand): Promise<void> {
    return this.sessionService.destroySession(command.cookies, command.res);
  }
}
