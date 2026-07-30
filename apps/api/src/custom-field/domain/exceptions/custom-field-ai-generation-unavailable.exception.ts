import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class CustomFieldAiGenerationUnavailableException extends DomainException {
  readonly code = 'CUSTOM_FIELD_AI_GENERATION_UNAVAILABLE';

  constructor(id: string) {
    super(`El campo personalizado ${id} no está configurado para generación automática`);
  }
}
