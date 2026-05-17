import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { InviteMemberCommand } from '../../application/commands/account/invite-member';
import { RemoveMemberCommand } from '../../application/commands/account/remove-member';
import { UpdateMemberRoleCommand } from '../../application/commands/account/update-member-role';
import { FindMembersQuery } from '../../application/queries/account/find-members';
import { FindMyAccountsQuery } from '../../application/queries/account/find-my-accounts';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AccountMemberAlreadyExistsException } from '../../domain/exceptions/account-member-already-exists.exception';
import { AccountMemberNotFoundException } from '../../domain/exceptions/account-member-not-found.exception';
import type { JwtPayload } from '../passport/jwt.strategy';
import type { AccountMemberDto, MyAccountDto } from '@tfg/types';

@ApiTags('account')
@Controller('auth/account')
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('my-accounts')
  async findMyAccounts(@CurrentUser('sub') userId: string): Promise<MyAccountDto[]> {
    try {
      return await this.queryBus.execute<FindMyAccountsQuery, MyAccountDto[]>(new FindMyAccountsQuery(userId));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get('members')
  async findMembers(@CurrentUser() payload: JwtPayload): Promise<AccountMemberDto[]> {
    try {
      return await this.queryBus.execute<FindMembersQuery, AccountMemberDto[]>(new FindMembersQuery(payload.accountId));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post('members/invite')
  @HttpCode(204)
  async inviteMember(@Body() dto: InviteMemberDto, @CurrentUser() payload: JwtPayload): Promise<void> {
    try {
      await this.commandBus.execute(
        new InviteMemberCommand(uuidv4(), payload.accountId, payload.sub, dto.email, dto.role),
      );
    } catch (error) {
      if (error instanceof AccountMemberAlreadyExistsException) throw new ConflictException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete('members/:userId')
  @HttpCode(204)
  async removeMember(@Param('userId') targetUserId: string, @CurrentUser() payload: JwtPayload): Promise<void> {
    try {
      await this.commandBus.execute(new RemoveMemberCommand(payload.accountId, targetUserId, payload.sub));
    } catch (error) {
      if (error instanceof AccountMemberNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException();
    }
  }

  @Patch('members/:userId/role')
  @HttpCode(204)
  async updateMemberRole(
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() payload: JwtPayload,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new UpdateMemberRoleCommand(payload.accountId, targetUserId, dto.role));
    } catch (error) {
      if (error instanceof AccountMemberNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
