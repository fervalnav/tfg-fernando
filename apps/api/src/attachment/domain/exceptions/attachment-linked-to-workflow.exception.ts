import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class AttachmentLinkedToWorkflowException extends DomainException {
  readonly code = 'ATTACHMENT_LINKED_TO_WORKFLOW';

  constructor(id: string) {
    super(`Attachment with id ${id} is linked to a completed workflow action`);
  }
}
