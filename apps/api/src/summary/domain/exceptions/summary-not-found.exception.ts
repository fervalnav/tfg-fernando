import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class SummaryNotFoundException extends DomainException {
  readonly code = 'SUMMARY_NOT_FOUND';
  constructor(id: string) {
    super(`Summary with id ${id} not found`);
  }
}
