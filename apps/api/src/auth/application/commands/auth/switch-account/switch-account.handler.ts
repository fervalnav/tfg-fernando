import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SwitchAccountCommand } from './switch-account.command';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';

@CommandHandler(SwitchAccountCommand)
export class SwitchAccountHandler implements ICommandHandler<SwitchAccountCommand, void> {
  constructor(private readonly sessionService: AuthSessionService) {}

  execute(command: SwitchAccountCommand): Promise<void> {
    return this.sessionService.switchAccount(command.userId, command.accountId, command.cookies, command.res);
  }
}
