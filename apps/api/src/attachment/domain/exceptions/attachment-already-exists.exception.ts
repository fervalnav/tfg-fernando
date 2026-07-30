import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class AttachmentAlreadyExistsException extends DomainException {
  readonly code = 'ATTACHMENT_ALREADY_EXISTS';

  constructor(id: string) {
    super(`Attachment with id ${id} already exists`);
  }
}
