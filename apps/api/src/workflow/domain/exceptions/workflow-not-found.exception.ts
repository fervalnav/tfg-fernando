import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class WorkflowNotFoundException extends DomainException {
  readonly code = 'WORKFLOW_NOT_FOUND';
  constructor(id: string) {
    super(`Workflow with id ${id} not found`);
  }
}
