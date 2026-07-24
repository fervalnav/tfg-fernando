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
import type { PaginatedResult, WorkflowDto, WorkflowDetailDto } from '@tfg/types';
import { WorkflowNotFoundException } from '../../domain/exceptions/workflow-not-found.exception';
import { WorkflowStepActionNotFoundException } from '../../domain/exceptions/workflow-step-action-not-found.exception';
import { CreateWorkflowCommand } from '../../application/commands/create-workflow';
import { UpdateWorkflowCommand } from '../../application/commands/update-workflow';
import { DeleteWorkflowCommand } from '../../application/commands/delete-workflow';
import { DuplicateWorkflowCommand } from '../../application/commands/duplicate-workflow';
import { UpdateWorkflowStepsCommand } from '../../application/commands/update-workflow-steps';
import { CreateDefaultStepActionCommand } from '../../application/commands/create-default-step-action';
import { UpdateDefaultStepActionCommand } from '../../application/commands/update-default-step-action';
import { DeleteDefaultStepActionCommand } from '../../application/commands/delete-default-step-action';
import { FindAllWorkflowsQuery } from '../../application/queries/find-all-workflows';
import { FindWorkflowByIdQuery } from '../../application/queries/find-workflow-by-id';
import { IdService } from '@/shared/domain/services/id.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { UpdateWorkflowStepsDto } from './dto/update-workflow-steps.dto';
import { CreateDefaultStepActionDto } from './dto/create-default-step-action.dto';
import { UpdateDefaultStepActionDto } from './dto/update-default-step-action.dto';

@Controller('workflows')
export class WorkflowController {
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
  ): Promise<PaginatedResult<WorkflowDto>> {
    try {
      return await this.queryBus.execute(new FindAllWorkflowsQuery(user.accountId, page, Math.min(limit, 20)));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWorkflowDto): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateWorkflowCommand(dto.id, user.accountId, dto.name, dto.description ?? null),
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<WorkflowDetailDto> {
    try {
      return await this.queryBus.execute(new FindWorkflowByIdQuery(id, user.accountId));
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new UpdateWorkflowCommand(id, user.accountId, dto.name, dto.description ?? null));
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteWorkflowCommand(id, user.accountId));
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Post(':id/duplicate')
  @HttpCode(201)
  async duplicate(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<{ id: string }> {
    try {
      const newId = this.idService.generate();
      await this.commandBus.execute(new DuplicateWorkflowCommand(id, newId, user.accountId));
      return { id: newId };
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id/steps')
  async updateSteps(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowStepsDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateWorkflowStepsCommand(
          id,
          user.accountId,
          dto.steps.map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            condition: s.condition ?? null,
            position: s.position,
          })),
        ),
      );
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Post(':workflowId/steps/:stepId/actions')
  @HttpCode(201)
  async createAction(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body() dto: CreateDefaultStepActionDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateDefaultStepActionCommand(
          dto.id,
          stepId,
          workflowId,
          user.accountId,
          dto.name,
          dto.targetType,
          dto.targetId ?? null,
          dto.metadata ?? null,
          dto.position,
        ),
      );
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':workflowId/steps/:stepId/actions/:actionId')
  async updateAction(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
    @Param('actionId') actionId: string,
    @Body() dto: UpdateDefaultStepActionDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new UpdateDefaultStepActionCommand(
          actionId,
          workflowId,
          user.accountId,
          dto.name,
          dto.targetType,
          dto.targetId ?? null,
          dto.metadata ?? null,
          dto.position,
        ),
      );
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof WorkflowStepActionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':workflowId/steps/:stepId/actions/:actionId')
  @HttpCode(204)
  async deleteAction(
    @CurrentUser() user: JwtPayload,
    @Param('workflowId') workflowId: string,
    @Param('actionId') actionId: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteDefaultStepActionCommand(actionId, workflowId, user.accountId));
    } catch (error) {
      if (error instanceof WorkflowNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof WorkflowStepActionNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
