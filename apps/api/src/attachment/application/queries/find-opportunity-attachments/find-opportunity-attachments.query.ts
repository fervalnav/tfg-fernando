import { Query } from '@nestjs/cqrs';
import type { AttachmentDto } from '@tfg/types';

export class FindOpportunityAttachmentsQuery extends Query<AttachmentDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
