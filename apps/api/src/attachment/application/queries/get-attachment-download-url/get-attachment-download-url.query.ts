import { Query } from '@nestjs/cqrs';
import type { AttachmentDownloadDto } from '@tfg/types';

export class GetAttachmentDownloadUrlQuery extends Query<AttachmentDownloadDto> {
  constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
