import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AttachmentDownloadDto, AttachmentDto } from '@tfg/types';
import { CurrentUser, type JwtPayload } from '@/auth';
import { OpportunityNotFoundException, OpportunityWorkflowConflictException } from '@/opportunity';
import { AttachmentAlreadyExistsException } from '../../domain/exceptions/attachment-already-exists.exception';
import { AttachmentNotFoundException } from '../../domain/exceptions/attachment-not-found.exception';
import { AttachmentLinkedToWorkflowException } from '../../domain/exceptions/attachment-linked-to-workflow.exception';
import { CreateAttachmentCommand } from '../../application/commands/create-attachment';
import { DeleteAttachmentCommand } from '../../application/commands/delete-attachment';
import { FindOpportunityAttachmentsQuery } from '../../application/queries/find-opportunity-attachments';
import { GetAttachmentDownloadUrlQuery } from '../../application/queries/get-attachment-download-url';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

const MAX_FILE_SIZE = 30 * 1024 * 1024;

@Controller('opportunities/:opportunityId/attachments')
export class OpportunityAttachmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
  ): Promise<AttachmentDto[]> {
    try {
      return await this.queryBus.execute(new FindOpportunityAttachmentsQuery(opportunityId, user.accountId));
    } catch (error) {
      if (error instanceof OpportunityNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  @ApiConsumes('multipart/form-data')
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CreateAttachmentDto,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number } | undefined,
  ): Promise<void> {
    if (!file) throw new BadRequestException('El archivo es obligatorio');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Por ahora solo se admiten documentos PDF');
    }
    try {
      await this.commandBus.execute(
        new CreateAttachmentCommand(
          dto.id,
          user.accountId,
          opportunityId,
          dto.workflowStepActionId ?? null,
          file.originalname,
          dto.description?.trim() || null,
          file.mimetype,
          file.size,
          file.buffer,
        ),
      );
    } catch (error) {
      if (error instanceof OpportunityNotFoundException || error instanceof AttachmentNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AttachmentAlreadyExistsException || error instanceof OpportunityWorkflowConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @Get(':id/download-url')
  async getDownloadUrl(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
  ): Promise<AttachmentDownloadDto> {
    try {
      return await this.queryBus.execute(new GetAttachmentDownloadUrlQuery(id, opportunityId, user.accountId));
    } catch (error) {
      if (error instanceof AttachmentNotFoundException) throw new NotFoundException(error.message);
      if (error instanceof AttachmentLinkedToWorkflowException) throw new ConflictException(error.message);
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('opportunityId') opportunityId: string,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(new DeleteAttachmentCommand(id, opportunityId, user.accountId));
    } catch (error) {
      if (error instanceof AttachmentNotFoundException) throw new NotFoundException(error.message);
      throw new InternalServerErrorException();
    }
  }
}
