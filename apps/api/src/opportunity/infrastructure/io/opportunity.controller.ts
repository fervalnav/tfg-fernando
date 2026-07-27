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
import { CurrentUser } from '@/auth';
import type { JwtPayload } from '@/auth';
import type { OpportunityDto, PaginatedResult, PipelineStatusTotalsDto } from '@tfg/types';
import { OpportunityNotFoundException } from '../../domain/exceptions/opportunity-not-found.exception';
import { CreateOpportunityCommand } from '../../application/commands/create-opportunity';
import { UpdateOpportunityCommand } from '../../application/commands/update-opportunity';
import { DeleteOpportunityCommand } from '../../application/commands/delete-opportunity';
import { TransitionOpportunityStatusCommand } from '../../application/commands/transition-opportunity-status';
import { UpdateOpportunityPositionCommand } from '../../application/commands/update-opportunity-position';
import { FindAllOpportunitiesQuery } from '../../application/queries/find-all-opportunities';
import { FindOpportunityByIdQuery } from '../../application/queries/find-opportunity-by-id';
import { FindKanbanOpportunitiesQuery } from '../../application/queries/find-kanban-opportunities';
import { FindPipelineStatusTotalsQuery } from '../../application/queries/find-pipeline-status-totals';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { TransitionOpportunityStatusDto } from './dto/transition-opportunity-status.dto';
import { UpdateOpportunityPositionDto } from './dto/update-opportunity-position.dto';
import type { OpportunityFilters } from '../../domain/opportunity.repository';

@Controller('opportunities')
export class OpportunityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // Declared before /:id to avoid route conflicts
  @Get('kanban')
  async findKanban(
    @CurrentUser() user: JwtPayload,
    @Query('pipelineId') pipelineId: string,
    @Query('q') q?: string,
    @Query('statusIds') statusIds?: string | string[],
    @Query('userId') userId?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('amountMin') amountMinRaw?: string,
    @Query('amountMax') amountMaxRaw?: string,
  ): Promise<OpportunityDto[]> {
    try {
      return await this.queryBus.execute(
        new FindKanbanOpportunitiesQuery(
          parseOpportunityFilters(
            user.accountId,
            pipelineId,
            q,
            statusIds,
            userId,
            dueDateFrom,
            dueDateTo,
            amountMinRaw,
            amountMaxRaw,
          ),
        ),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get('status-totals')
  async findStatusTotals(
    @CurrentUser() user: JwtPayload,
    @Query('pipelineId') pipelineId: string,
    @Query('q') q?: string,
    @Query('statusIds') statusIds?: string | string[],
    @Query('userId') userId?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('amountMin') amountMinRaw?: string,
    @Query('amountMax') amountMaxRaw?: string,
  ): Promise<PipelineStatusTotalsDto[]> {
    try {
      return await this.queryBus.execute(
        new FindPipelineStatusTotalsQuery(
          parseOpportunityFilters(
            user.accountId,
            pipelineId,
            q,
            statusIds,
            userId,
            dueDateFrom,
            dueDateTo,
            amountMinRaw,
            amountMaxRaw,
          ),
        ),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('pipelineId') pipelineId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('q') q?: string,
    @Query('statusIds') statusIds?: string | string[],
    @Query('userId') userId?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('amountMin') amountMinRaw?: string,
    @Query('amountMax') amountMaxRaw?: string,
  ): Promise<PaginatedResult<OpportunityDto>> {
    try {
      const filters = parseOpportunityFilters(
        user.accountId,
        pipelineId,
        q,
        statusIds,
        userId,
        dueDateFrom,
        dueDateTo,
        amountMinRaw,
        amountMaxRaw,
      );

      return await this.queryBus.execute(
        new FindAllOpportunitiesQuery(
          filters.accountId,
          filters.pipelineId,
          page,
          Math.min(limit, 50),
          filters.q,
          filters.statusIds,
          filters.userId,
          filters.dueDateFrom,
          filters.dueDateTo,
          filters.amountMin,
          filters.amountMax,
        ),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOpportunityDto): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateOpportunityCommand(
          dto.id,
          user.accountId,
          dto.title,
          dto.description ?? null,
          dto.amount ?? null,
          dto.currency ?? null,
          dto.pipelineId,
          dto.pipelineStatusId,
          dto.workflowId ?? null,
          dto.dueDate ? new Date(dto.dueDate) : null,
        ),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<OpportunityDto> {
    try {
      return await this.queryBus.execute(new FindOpportunityByIdQuery(id, user.accountId));
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateOpportunityCommand(
          id,
          user.accountId,
          dto.title,
          dto.description,
          dto.amount,
          dto.currency,
          dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
        ),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteOpportunityCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/status')
  async transitionStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TransitionOpportunityStatusDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new TransitionOpportunityStatusCommand(
          id,
          user.accountId,
          dto.pipelineStatusId,
          dto.finalOutcomeType ?? null,
          dto.sortPoints,
        ),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/position')
  async updatePosition(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityPositionDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateOpportunityPositionCommand(id, user.accountId, dto.sortPoints, dto.pipelineStatusId),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}

function parseOpportunityFilters(
  accountId: string,
  pipelineId: string,
  q?: string,
  statusIds?: string | string[],
  userId?: string,
  dueDateFrom?: string,
  dueDateTo?: string,
  amountMinRaw?: string,
  amountMaxRaw?: string,
): OpportunityFilters {
  const amountMin = amountMinRaw ? Number(amountMinRaw) : undefined;
  const amountMax = amountMaxRaw ? Number(amountMaxRaw) : undefined;

  return {
    accountId,
    pipelineId,
    q: q?.trim() || undefined,
    statusIds: statusIds ? (Array.isArray(statusIds) ? statusIds : [statusIds]) : undefined,
    userId,
    dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : undefined,
    dueDateTo: dueDateTo ? new Date(dueDateTo) : undefined,
    amountMin: amountMin !== undefined && Number.isFinite(amountMin) ? amountMin : undefined,
    amountMax: amountMax !== undefined && Number.isFinite(amountMax) ? amountMax : undefined,
  };
}
