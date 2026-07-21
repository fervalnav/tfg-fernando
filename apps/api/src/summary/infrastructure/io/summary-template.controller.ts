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
import type { PaginatedResult, SummaryTemplateDto } from '@tfg/types';
import { SummaryTemplateNotFoundException } from '../../domain/exceptions/summary-template-not-found.exception';
import { CreateSummaryTemplateCommand } from '../../application/commands/create-summary-template';
import { UpdateSummaryTemplateCommand } from '../../application/commands/update-summary-template';
import { DeleteSummaryTemplateCommand } from '../../application/commands/delete-summary-template';
import { FindSummaryTemplatesQuery } from '../../application/queries/find-summary-templates';
import { CreateSummaryTemplateDto } from './dto/create-summary-template.dto';
import { UpdateSummaryTemplateDto } from './dto/update-summary-template.dto';

@ApiTags('summaries')
@Controller('summaries/templates')
export class SummaryTemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<SummaryTemplateDto>> {
    try {
      return await this.queryBus.execute(new FindSummaryTemplatesQuery(user.accountId, page, limit));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSummaryTemplateDto): Promise<void> {
    try {
      await this.commandBus.execute(new CreateSummaryTemplateCommand(dto.id, user.accountId, dto.name, dto.prompt));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSummaryTemplateDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new UpdateSummaryTemplateCommand(id, user.accountId, dto.name, dto.prompt));
    } catch (error) {
      if (error instanceof SummaryTemplateNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteSummaryTemplateCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof SummaryTemplateNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
