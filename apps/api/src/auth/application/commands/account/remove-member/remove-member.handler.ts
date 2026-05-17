import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException as NestForbiddenException } from '@nestjs/common';
import { RemoveMemberCommand } from './remove-member.command';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { AccountMemberNotFoundException } from '../../../../domain/exceptions/account-member-not-found.exception';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand, void> {
  constructor(private readonly memberRepo: AccountMemberRepository) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    if (command.targetUserId === command.requestingUserId) {
      throw new NestForbiddenException('Cannot remove yourself from the account');
    }

    const member = await this.memberRepo.findByUserAndAccount(command.targetUserId, command.accountId);
    if (!member) throw new AccountMemberNotFoundException(command.targetUserId, command.accountId);

    await this.memberRepo.delete(member.id);
  }
}
