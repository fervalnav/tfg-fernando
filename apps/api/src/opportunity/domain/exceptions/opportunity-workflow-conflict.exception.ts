import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class OpportunityWorkflowConflictException extends DomainException {
  readonly code = 'OPPORTUNITY_WORKFLOW_CONFLICT';

  constructor(message: string) {
    super(message);
  }
}
