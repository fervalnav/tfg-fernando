import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class ControlQuestionNotFoundException extends DomainException {
  readonly code = 'CONTROL_QUESTION_NOT_FOUND';
  constructor(id: string) {
    super(`Control question with id ${id} not found`);
  }
}
