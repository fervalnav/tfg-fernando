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
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@/auth';
import type { JwtPayload } from '@/auth';
import type { PaginatedResult, PipelineDto } from '@tfg/types';
import { PipelineNotFoundException } from '../../domain/exceptions/pipeline-not-found.exception';
import { PipelineStatusNotFoundException } from '../../domain/exceptions/pipeline-status-not-found.exception';
import { InvalidPipelineStatusException } from '../../domain/exceptions/invalid-pipeline-status.exception';
import { CreatePipelineCommand } from '../../application/commands/create-pipeline';
import { UpdatePipelineCommand } from '../../application/commands/update-pipeline';
import { DeletePipelineCommand } from '../../application/commands/delete-pipeline';
import { CreatePipelineStatusCommand } from '../../application/commands/create-pipeline-status';
import { UpdatePipelineStatusCommand } from '../../application/commands/update-pipeline-status';
import { DeletePipelineStatusCommand } from '../../application/commands/delete-pipeline-status';
import { ReorderPipelineStatusesCommand } from '../../application/commands/reorder-pipeline-statuses';
import { SetInitialPipelineStatusCommand } from '../../application/commands/set-initial-pipeline-status';
import { FindAllPipelinesQuery } from '../../application/queries/find-all-pipelines';
import { FindPipelineByIdQuery } from '../../application/queries/find-pipeline-by-id';
import { IdService } from '@/shared/domain/services/id.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStatusDto } from './dto/create-pipeline-status.dto';
import { UpdatePipelineStatusDto } from './dto/update-pipeline-status.dto';
import { ReorderPipelineStatusesDto } from './dto/reorder-pipeline-statuses.dto';
import type { OutcomeType } from '../../domain/value-objects/outcome-type.vo';

@Controller('pipelines')
export class PipelineController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly idService: IdService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResult<PipelineDto>> {
    try {
      return await this.queryBus.execute(new FindAllPipelinesQuery(user.accountId, page, Math.min(limit, 20)));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePipelineDto): Promise<void> {
    try {
      await this.commandBus.execute(new CreatePipelineCommand(dto.id, user.accountId, dto.name));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<PipelineDto> {
    try {
      return await this.queryBus.execute(new FindPipelineByIdQuery(id, user.accountId));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new UpdatePipelineCommand(id, user.accountId, dto.name));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeletePipelineCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Post(':id/statuses')
  @HttpCode(201)
  async createStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') pipelineId: string,
    @Body() dto: CreatePipelineStatusDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreatePipelineStatusCommand(
          dto.id,
          pipelineId,
          user.accountId,
          dto.name,
          dto.description ?? null,
          dto.backgroundColor ?? null,
          dto.textColor ?? null,
          dto.isTerminal ?? false,
          (dto.outcomeType as OutcomeType) ?? 'NONE',
          dto.showInKanban ?? true,
        ),
      );
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof InvalidPipelineStatusException) throw new UnprocessableEntityException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/statuses/positions')
  async reorderStatuses(
    @CurrentUser() user: JwtPayload,
    @Param('id') pipelineId: string,
    @Body() dto: ReorderPipelineStatusesDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new ReorderPipelineStatusesCommand(pipelineId, user.accountId, dto.ids));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/statuses/:statusId')
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') pipelineId: string,
    @Param('statusId') statusId: string,
    @Body() dto: UpdatePipelineStatusDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdatePipelineStatusCommand(
          statusId,
          pipelineId,
          user.accountId,
          dto.name,
          dto.description !== undefined ? (dto.description ?? null) : undefined,
          dto.backgroundColor !== undefined ? (dto.backgroundColor ?? null) : undefined,
          dto.textColor !== undefined ? (dto.textColor ?? null) : undefined,
          dto.isTerminal,
          dto.outcomeType as OutcomeType | undefined,
          dto.showInKanban,
        ),
      );
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof PipelineStatusNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof InvalidPipelineStatusException) throw new UnprocessableEntityException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id/statuses/:statusId')
  @HttpCode(204)
  async deleteStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') pipelineId: string,
    @Param('statusId') statusId: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new DeletePipelineStatusCommand(statusId, pipelineId, user.accountId));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof PipelineStatusNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/statuses/:statusId/initial')
  async setInitialStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') pipelineId: string,
    @Param('statusId') statusId: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new SetInitialPipelineStatusCommand(statusId, pipelineId, user.accountId));
    } catch (error) {
      if (error instanceof PipelineNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof PipelineStatusNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof InvalidPipelineStatusException) throw new UnprocessableEntityException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
