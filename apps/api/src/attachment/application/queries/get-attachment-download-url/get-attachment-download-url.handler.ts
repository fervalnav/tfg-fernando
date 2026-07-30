import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { AttachmentDownloadDto } from '@tfg/types';
import { AttachmentRepository } from '../../../domain/attachment.repository';
import { AttachmentStorageService } from '../../../domain/attachment-storage.service';
import { AttachmentNotFoundException } from '../../../domain/exceptions/attachment-not-found.exception';
import { GetAttachmentDownloadUrlQuery } from './get-attachment-download-url.query';

@QueryHandler(GetAttachmentDownloadUrlQuery)
export class GetAttachmentDownloadUrlHandler implements IQueryHandler<
  GetAttachmentDownloadUrlQuery,
  AttachmentDownloadDto
> {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly storage: AttachmentStorageService,
  ) {}

  async execute(query: GetAttachmentDownloadUrlQuery): Promise<AttachmentDownloadDto> {
    const attachment = await this.attachments.findById(query.id);
    if (!attachment || attachment.accountId !== query.accountId || attachment.opportunityId !== query.opportunityId) {
      throw new AttachmentNotFoundException(query.id);
    }
    return { url: await this.storage.createDownloadUrl(attachment.fileKey) };
  }
}
