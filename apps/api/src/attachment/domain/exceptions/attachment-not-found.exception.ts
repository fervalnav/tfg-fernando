import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class AttachmentNotFoundException extends DomainException {
  readonly code = 'ATTACHMENT_NOT_FOUND';

  constructor(id: string) {
    super(`Attachment with id ${id} not found`);
  }
}
