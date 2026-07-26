import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class OpportunityNotFoundException extends DomainException {
  readonly code = 'OPPORTUNITY_NOT_FOUND';
  constructor(id: string) {
    super(`Opportunity with id ${id} not found`);
  }
}
