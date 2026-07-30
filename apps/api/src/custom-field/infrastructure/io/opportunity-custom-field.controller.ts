import {
  Body,
  ConflictException,
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
import type { CustomFieldDto } from '@tfg/types';
import { CurrentUser, type JwtPayload } from '@/auth';
import { OpportunityNotFoundException } from '@/opportunity';
import { CustomFieldNotFoundException } from '../../domain/exceptions/custom-field-not-found.exception';
import { SetCustomFieldValueCommand } from '../../application/commands/set-custom-field-value';
import { FindOpportunityCustomFieldsQuery } from '../../application/queries/find-opportunity-custom-fields';
import { SetCustomFieldValueDto } from './dto/set-custom-field-value.dto';
import { AddCustomFieldToOpportunityCommand } from '../../application/commands/add-custom-field-to-opportunity';
import { DefaultCustomFieldNotFoundException } from '../../domain/exceptions/default-custom-field-not-found.exception';
import { AddCustomFieldToOpportunityDto } from './dto/add-custom-field-to-opportunity.dto';
import { RequestCustomFieldAiGenerationCommand } from '../../application/commands/request-custom-field-ai-generation';
import { CustomFieldAiGenerationUnavailableException } from '../../domain/exceptions/custom-field-ai-generation-unavailable.exception';

@Controller('opportunities/:opportunityId/custom-fields')
export class OpportunityCustomFieldController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
  ): Promise<CustomFieldDto[]> {
    try {
      return await this.queryBus.execute(new FindOpportunityCustomFieldsQuery(opportunityId, user.accountId));
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  async add(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: AddCustomFieldToOpportunityDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new AddCustomFieldToOpportunityCommand(dto.id, opportunityId, user.accountId, dto.defaultCustomFieldId),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof DefaultCustomFieldNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
    @Body() dto: SetCustomFieldValueDto,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new SetCustomFieldValueCommand(opportunityId, user.accountId, id, dto.value));
    } catch (error) {
      if (error instanceof CustomFieldNotFoundException) throw new NotFoundException(error.message);
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
      await this.commandBus.execute(new RequestCustomFieldAiGenerationCommand(opportunityId, user.accountId, id));
    } catch (error) {
      if (error instanceof CustomFieldNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof CustomFieldAiGenerationUnavailableException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
