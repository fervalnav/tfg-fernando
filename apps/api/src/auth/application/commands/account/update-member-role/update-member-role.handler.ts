import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMemberRoleCommand } from './update-member-role.command';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { AccountMemberNotFoundException } from '../../../../domain/exceptions/account-member-not-found.exception';

@CommandHandler(UpdateMemberRoleCommand)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleCommand, void> {
  constructor(private readonly memberRepo: AccountMemberRepository) {}

  async execute(command: UpdateMemberRoleCommand): Promise<void> {
    const member = await this.memberRepo.findByUserAndAccount(command.targetUserId, command.accountId);
    if (!member) throw new AccountMemberNotFoundException(command.targetUserId, command.accountId);

    member.updateRole(command.role);
    await this.memberRepo.save(member);
  }
}
