import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';
import type { AuthResponseDto } from '@tfg/types';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResponseDto> {
  constructor(private readonly sessionService: AuthSessionService) {}

  execute(command: LoginCommand): Promise<AuthResponseDto> {
    return this.sessionService.createSession(command.user, command.res);
  }
}
