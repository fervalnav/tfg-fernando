import { Command } from '@nestjs/cqrs';

export class UpdateAvatarCommand extends Command<{ avatarUrl: string }> {
  constructor(
    public readonly userId: string,
    public readonly fileBuffer: Buffer,
    public readonly mimetype: string,
    public readonly originalName: string,
  ) {
    super();
  }
}
