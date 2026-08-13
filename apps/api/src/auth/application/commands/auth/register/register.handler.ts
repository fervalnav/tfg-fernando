import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

import { RegisterCommand } from './register.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { AccountRepository } from '../../../../domain/repositories/account.repository';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { User } from '../../../../domain/entities/user.entity';
import { Account } from '../../../../domain/entities/account.entity';
import { AccountMember } from '../../../../domain/entities/account-member.entity';
import { UserAlreadyExistsException } from '../../../../domain/exceptions/user-already-exists.exception';
import { IdService } from '@/shared/domain/services/id.service';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';
import type { AuthResponseDto } from '@tfg/types';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, AuthResponseDto> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly accountRepo: AccountRepository,
    private readonly memberRepo: AccountMemberRepository,
    private readonly idService: IdService,
    private readonly sessionService: AuthSessionService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findByEmail(command.email);
    if (existing) throw new UserAlreadyExistsException(command.email);

    const passwordHash = await bcrypt.hash(command.password, 12);

    const account = Account.create({
      id: command.accountId,
      name: command.accountName,
    });
    const user = User.create({
      id: command.id,
      email: command.email,
      passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
    });
    await this.accountRepo.save(account);
    await this.userRepo.save(user);

    const member = AccountMember.create({
      id: this.idService.generate(),
      accountId: account.id,
      userId: user.id,
      role: 'ADMIN',
      isDefault: true,
    });
    await this.memberRepo.save(member);

    const result: AuthResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      accountId: account.id,
    };

    await this.sessionService.createSessionByIds(user.id, account.id, command.res);

    await this.eventBus.publishAll(account.pullDomainEvents());

    return result;
  }
}
