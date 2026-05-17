import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from './update-profile.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../../../domain/exceptions/user-not-found.exception';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, void> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) throw new UserNotFoundException(command.userId);

    user.updateProfile({
      firstName: command.firstName,
      lastName: command.lastName,
    });
    await this.userRepo.save(user);
  }
}
