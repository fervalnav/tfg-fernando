import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class DefaultControlQuestionNotFoundException extends DomainException {
  readonly code = 'DEFAULT_CONTROL_QUESTION_NOT_FOUND';
  constructor(id: string) {
    super(`Default control question with id ${id} not found`);
  }
}
