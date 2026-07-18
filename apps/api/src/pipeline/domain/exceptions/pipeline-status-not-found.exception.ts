import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class PipelineStatusNotFoundException extends DomainException {
  readonly code = 'PIPELINE_STATUS_NOT_FOUND';
  constructor(id: string) {
    super(`Pipeline status with id ${id} not found`);
  }
}
