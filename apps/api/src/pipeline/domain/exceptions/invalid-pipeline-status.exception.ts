import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class InvalidPipelineStatusException extends DomainException {
  readonly code = 'INVALID_PIPELINE_STATUS';
}
