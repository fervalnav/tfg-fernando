import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class PipelineNotFoundException extends DomainException {
  readonly code = 'PIPELINE_NOT_FOUND';
  constructor(id: string) {
    super(`Pipeline with id ${id} not found`);
  }
}
