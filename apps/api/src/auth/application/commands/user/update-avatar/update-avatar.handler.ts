import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { extname } from 'node:path';
import { UpdateAvatarCommand } from './update-avatar.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../../../domain/exceptions/user-not-found.exception';
import { StorageService } from '../../../../../shared/infrastructure/storage/storage.service';

@CommandHandler(UpdateAvatarCommand)
export class UpdateAvatarHandler implements ICommandHandler<UpdateAvatarCommand, { avatarUrl: string }> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(command: UpdateAvatarCommand): Promise<{ avatarUrl: string }> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) throw new UserNotFoundException(command.userId);

    const ext = extname(command.originalName).toLowerCase() || '.jpg';
    const key = `avatars/${command.userId}${ext}`;

    const url = await this.storage.upload({
      key,
      body: command.fileBuffer,
      contentType: command.mimetype,
    });

    user.updateAvatarUrl(url);
    await this.userRepo.save(user);

    return { avatarUrl: url };
  }
}
