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
import type { PaginatedResult, DefaultControlQuestionDto } from '@tfg/types';
import { DefaultControlQuestionNotFoundException } from '../../domain/exceptions/default-control-question-not-found.exception';
import { CreateDefaultControlQuestionCommand } from '../../application/commands/create-default-control-question';
import { UpdateDefaultControlQuestionCommand } from '../../application/commands/update-default-control-question';
import { DeleteDefaultControlQuestionCommand } from '../../application/commands/delete-default-control-question';
import { FindDefaultControlQuestionsQuery } from '../../application/queries/find-default-control-questions';
import { CreateDefaultControlQuestionDto } from './dto/create-default-control-question.dto';
import { UpdateDefaultControlQuestionDto } from './dto/update-default-control-question.dto';

@ApiTags('control-questions')
@Controller('control-questions/defaults')
export class DefaultControlQuestionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<DefaultControlQuestionDto>> {
    try {
      return await this.queryBus.execute(new FindDefaultControlQuestionsQuery(user.accountId, page, limit));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDefaultControlQuestionDto): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateDefaultControlQuestionCommand(
          dto.id,
          user.accountId,
          dto.question,
          dto.answerType,
          dto.passConditionPrompt ?? null,
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
    @Body() dto: UpdateDefaultControlQuestionDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateDefaultControlQuestionCommand(
          id,
          user.accountId,
          dto.question,
          dto.answerType,
          dto.passConditionPrompt,
        ),
      );
    } catch (error) {
      if (error instanceof DefaultControlQuestionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteDefaultControlQuestionCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof DefaultControlQuestionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
