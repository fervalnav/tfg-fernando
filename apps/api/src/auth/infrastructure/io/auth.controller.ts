import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IdService } from '@/shared/domain/services/id.service';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { SwitchAccountDto } from './dto/switch-account.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { RegisterCommand } from '../../application/commands/auth/register';
import { AcceptInvitationCommand } from '../../application/commands/account/accept-invitation';
import { LoginCommand } from '../../application/commands/auth/login';
import { RefreshTokenCommand } from '../../application/commands/auth/refresh-token';
import { LogoutCommand } from '../../application/commands/auth/logout';
import { SwitchAccountCommand } from '../../application/commands/auth/switch-account';
import { GetMeQuery } from '../../application/queries/auth/get-me';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvitationTokenInvalidException } from '../../domain/exceptions/invitation-token-invalid.exception';
import type { JwtPayload } from '../passport/jwt.strategy';
import type { User } from '../../domain/entities/user.entity';
import type { AuthResponseDto, UserDto } from '@tfg/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly idService: IdService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    try {
      return await this.commandBus.execute<RegisterCommand, AuthResponseDto>(
        new RegisterCommand(
          this.idService.generate(),
          this.idService.generate(),
          dto.email,
          dto.password,
          dto.firstName,
          dto.lastName,
          dto.accountName,
          res,
        ),
      );
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) throw new ConflictException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    try {
      return await this.commandBus.execute<LoginCommand, AuthResponseDto>(new LoginCommand(req.user, res));
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException();
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(204)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    try {
      await this.commandBus.execute<RefreshTokenCommand, void>(
        new RefreshTokenCommand(req.cookies as Record<string, string>, res),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException();
    }
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(req.cookies as Record<string, string>, res));
  }

  @Post('switch-account')
  @HttpCode(204)
  async switchAccount(
    @Body() dto: SwitchAccountDto,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.commandBus.execute<SwitchAccountCommand, void>(
        new SwitchAccountCommand(userId, dto.accountId, req.cookies as Record<string, string>, res),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException();
    }
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(201)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    try {
      return await this.commandBus.execute<AcceptInvitationCommand, AuthResponseDto>(
        new AcceptInvitationCommand(
          this.idService.generate(),
          dto.token,
          dto.firstName,
          dto.lastName,
          dto.password,
          res,
        ),
      );
    } catch (error) {
      if (error instanceof InvitationTokenInvalidException) throw new UnauthorizedException(error.message);
      if (error instanceof UserAlreadyExistsException) throw new ConflictException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Get('me')
  async getMe(@CurrentUser() payload: JwtPayload): Promise<UserDto> {
    try {
      return await this.queryBus.execute<GetMeQuery, UserDto>(new GetMeQuery(payload.sub));
    } catch (error) {
      if (error instanceof UserNotFoundException) throw new UnauthorizedException();
      throw new InternalServerErrorException();
    }
  }
}
