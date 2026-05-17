import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateProfileCommand } from '../../application/commands/user/update-profile';
import { UpdateAvatarCommand } from '../../application/commands/user/update-avatar';
import { GetMeQuery } from '../../application/queries/auth/get-me';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import type { JwtPayload } from '../passport/jwt.strategy';
import type { UserDto } from '@tfg/types';

@ApiTags('user')
@Controller('auth/me')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getProfile(@CurrentUser() payload: JwtPayload): Promise<UserDto> {
    try {
      return await this.queryBus.execute<GetMeQuery, UserDto>(new GetMeQuery(payload.sub));
    } catch (error) {
      if (error instanceof UserNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch()
  @HttpCode(200)
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() payload: JwtPayload): Promise<UserDto> {
    try {
      await this.commandBus.execute(new UpdateProfileCommand(payload.sub, dto.firstName, dto.lastName));
      return await this.queryBus.execute<GetMeQuery, UserDto>(new GetMeQuery(payload.sub));
    } catch (error) {
      if (error instanceof UserNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch('avatar')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async updateAvatar(
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string } | undefined,
    @CurrentUser() payload: JwtPayload,
  ): Promise<{ avatarUrl: string }> {
    if (!file) throw new BadRequestException('File is required');

    try {
      return await this.commandBus.execute<UpdateAvatarCommand, { avatarUrl: string }>(
        new UpdateAvatarCommand(payload.sub, file.buffer, file.mimetype, file.originalname),
      );
    } catch (error) {
      if (error instanceof UserNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
