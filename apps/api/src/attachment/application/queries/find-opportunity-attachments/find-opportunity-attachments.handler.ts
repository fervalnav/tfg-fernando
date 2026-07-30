import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { AttachmentDto as IAttachmentDto } from '@tfg/types';
import { OpportunityFinder } from '@/opportunity';
import { AttachmentRepository } from '../../../domain/attachment.repository';
import { AttachmentDto } from './attachment.dto';
import { FindOpportunityAttachmentsQuery } from './find-opportunity-attachments.query';

@QueryHandler(FindOpportunityAttachmentsQuery)
export class FindOpportunityAttachmentsHandler implements IQueryHandler<
  FindOpportunityAttachmentsQuery,
  IAttachmentDto[]
> {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly opportunityFinder: OpportunityFinder,
  ) {}

  async execute(query: FindOpportunityAttachmentsQuery): Promise<IAttachmentDto[]> {
    await this.opportunityFinder.find(query.opportunityId, query.accountId);
    const attachments = await this.attachments.findByOpportunityId(query.opportunityId, query.accountId);
    return attachments.map((attachment) => AttachmentDto.fromEntity(attachment));
  }
}
