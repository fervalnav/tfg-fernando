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
import type { ControlQuestionDto } from '@tfg/types';
import { CurrentUser, type JwtPayload } from '@/auth';
import { OpportunityNotFoundException } from '@/opportunity';
import { ControlQuestionNotFoundException } from '../../domain/exceptions/control-question-not-found.exception';
import { AnswerControlQuestionCommand } from '../../application/commands/answer-control-question';
import { FindOpportunityControlQuestionsQuery } from '../../application/queries/find-opportunity-control-questions';
import { AnswerControlQuestionDto } from './dto/answer-control-question.dto';
import { AddControlQuestionToOpportunityCommand } from '../../application/commands/add-control-question-to-opportunity';
import { DefaultControlQuestionNotFoundException } from '../../domain/exceptions/default-control-question-not-found.exception';
import { AddControlQuestionToOpportunityDto } from './dto/add-control-question-to-opportunity.dto';

@Controller('opportunities/:opportunityId/control-questions')
export class OpportunityControlQuestionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
  ): Promise<ControlQuestionDto[]> {
    try {
      return await this.queryBus.execute(new FindOpportunityControlQuestionsQuery(opportunityId, user.accountId));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async add(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: AddControlQuestionToOpportunityDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new AddControlQuestionToOpportunityCommand(dto.id, opportunityId, user.accountId, dto.defaultControlQuestionId),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof DefaultControlQuestionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async answer(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
    @Body() dto: AnswerControlQuestionDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new AnswerControlQuestionCommand(opportunityId, user.accountId, id, dto.answer));
    } catch (error) {
      if (error instanceof ControlQuestionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
