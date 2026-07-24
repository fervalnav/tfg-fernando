import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class WorkflowStepActionNotFoundException extends DomainException {
  readonly code = 'WORKFLOW_STEP_ACTION_NOT_FOUND';
  constructor(id: string) {
    super(`Workflow step action with id ${id} not found`);
  }
}
