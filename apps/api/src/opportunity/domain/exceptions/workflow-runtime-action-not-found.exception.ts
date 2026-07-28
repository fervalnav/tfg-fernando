import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class WorkflowRuntimeActionNotFoundException extends DomainException {
  readonly code = 'WORKFLOW_RUNTIME_ACTION_NOT_FOUND';

  constructor(id: string) {
    super(`Workflow action with id ${id} not found`);
  }
}
