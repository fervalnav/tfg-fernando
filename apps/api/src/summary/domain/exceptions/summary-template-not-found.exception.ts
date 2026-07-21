import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class SummaryTemplateNotFoundException extends DomainException {
  readonly code = 'SUMMARY_TEMPLATE_NOT_FOUND';
  constructor(id: string) {
    super(`Summary template with id ${id} not found`);
  }
}
