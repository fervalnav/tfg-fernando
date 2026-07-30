import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { SummaryDto } from '@tfg/types';
import { CurrentUser, type JwtPayload } from '@/auth';
import { OpportunityNotFoundException } from '@/opportunity';
import { SummaryNotFoundException } from '../../domain/exceptions/summary-not-found.exception';
import { UpdateSummaryResultCommand } from '../../application/commands/update-summary-result';
import { FindOpportunitySummariesQuery } from '../../application/queries/find-opportunity-summaries';
import { UpdateSummaryResultDto } from './dto/update-summary-result.dto';
import { AddSummaryToOpportunityCommand } from '../../application/commands/add-summary-to-opportunity';
import { SummaryTemplateNotFoundException } from '../../domain/exceptions/summary-template-not-found.exception';
import { AddSummaryToOpportunityDto } from './dto/add-summary-to-opportunity.dto';
import { RequestSummaryAiGenerationCommand } from '../../application/commands/request-summary-ai-generation';

@Controller('opportunities/:opportunityId/summaries')
export class OpportunitySummaryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Param('opportunityId') opportunityId: string): Promise<SummaryDto[]> {
    try {
      return await this.queryBus.execute(new FindOpportunitySummariesQuery(opportunityId, user.accountId));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async add(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: AddSummaryToOpportunityDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new AddSummaryToOpportunityCommand(dto.id, opportunityId, user.accountId, dto.summaryTemplateId),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof SummaryTemplateNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSummaryResultDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new UpdateSummaryResultCommand(opportunityId, user.accountId, id, dto.result));
    } catch (error) {
      if (error instanceof SummaryNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Post(':id/generate')
  @HttpCode(202)
  async generate(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new RequestSummaryAiGenerationCommand(opportunityId, user.accountId, id));
    } catch (error) {
      if (error instanceof SummaryNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
