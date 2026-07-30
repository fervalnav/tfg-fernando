import { Injectable } from '@nestjs/common';
import type { AiGenerationDocument } from '@/ai';
import { AttachmentRepository } from '../../domain/attachment.repository';
import { AttachmentStorageService } from '../../domain/attachment-storage.service';

@Injectable()
export class OpportunityAttachmentDocumentsService {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly storage: AttachmentStorageService,
  ) {}

  async find(opportunityId: string, accountId: string): Promise<AiGenerationDocument[]> {
    const attachments = await this.attachments.findByOpportunityId(opportunityId, accountId);
    return Promise.all(
      attachments.map(async (attachment) => {
        const data = attachment.toPrimitives();
        return {
          filename: data.name,
          mediaType: data.mimeType,
          data: await this.storage.download(data.fileKey),
        };
      }),
    );
  }
}
