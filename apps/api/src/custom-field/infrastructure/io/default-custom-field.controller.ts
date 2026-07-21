import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth';
import type { JwtPayload } from '@/auth';
import type { PaginatedResult, DefaultCustomFieldDto } from '@tfg/types';
import { DefaultCustomFieldNotFoundException } from '../../domain/exceptions/default-custom-field-not-found.exception';
import { CreateDefaultCustomFieldCommand } from '../../application/commands/create-default-custom-field';
import { UpdateDefaultCustomFieldCommand } from '../../application/commands/update-default-custom-field';
import { DeleteDefaultCustomFieldCommand } from '../../application/commands/delete-default-custom-field';
import { FindDefaultCustomFieldsQuery } from '../../application/queries/find-default-custom-fields';
import { CreateDefaultCustomFieldDto } from './dto/create-default-custom-field.dto';
import { UpdateDefaultCustomFieldDto } from './dto/update-default-custom-field.dto';

@ApiTags('custom-fields')
@Controller('custom-fields/defaults')
export class DefaultCustomFieldController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<DefaultCustomFieldDto>> {
    try {
      return await this.queryBus.execute(new FindDefaultCustomFieldsQuery(user.accountId, page, limit));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDefaultCustomFieldDto): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateDefaultCustomFieldCommand(
          dto.id,
          user.accountId,
          dto.name,
          dto.description ?? null,
          dto.type,
          dto.classifiers ?? [],
          dto.canSelectMultiple ?? false,
          dto.automatic ?? false,
          dto.aiPrompt ?? null,
        ),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDefaultCustomFieldDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateDefaultCustomFieldCommand(
          id,
          user.accountId,
          dto.name,
          dto.description,
          dto.type,
          dto.classifiers,
          dto.canSelectMultiple,
          dto.automatic,
          dto.aiPrompt,
        ),
      );
    } catch (error) {
      if (error instanceof DefaultCustomFieldNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteDefaultCustomFieldCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof DefaultCustomFieldNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
