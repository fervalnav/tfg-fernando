import type { AiGenerationStatus } from '@tfg/types';
import { AggregateRoot } from '@/shared/domain/aggregate-root';
import {
  OpportunityQualificationGenerationFailedEvent,
  OpportunityQualificationUpdatedEvent,
} from '@/opportunity/domain/events/opportunity-workflow.events';
import { SummaryAiGenerationRequestedEvent } from './events/summary-ai.events';

type Primitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  summaryTemplateId: string;
  name: string;
  prompt: string;
  result: string | null;
  generationStatus: AiGenerationStatus;
  generationError: string | null;
  generatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Summary extends AggregateRoot {
  private constructor(
    private readonly data: Omit<
      Primitives,
      'result' | 'generationStatus' | 'generationError' | 'generatedAt' | 'updatedAt'
    >,
    private _result: string | null,
    private _generationStatus: AiGenerationStatus,
    private _generationError: string | null,
    private _generatedAt: Date | null,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(
    params: Omit<
      Primitives,
      'result' | 'generationStatus' | 'generationError' | 'generatedAt' | 'createdAt' | 'updatedAt'
    >,
  ): Summary {
    const now = new Date();
    return new Summary({ ...params, createdAt: now }, null, 'IDLE', null, null, now);
  }

  static fromPrimitives(data: Primitives): Summary {
    const { result, generationStatus, generationError, generatedAt, updatedAt, ...rest } = data;
    return new Summary(rest, result, generationStatus, generationError, generatedAt, updatedAt);
  }

  updateResult(result: string): void {
    if (!result.trim()) throw new Error('El resumen no puede estar vacío');
    this._result = result.trim();
    this._updatedAt = new Date();
    this.record(
      new OpportunityQualificationUpdatedEvent(this.data.opportunityId, this.data.accountId, 'summary', this.data.id),
    );
  }

  requestAiGeneration(): boolean {
    if (this._generationStatus === 'PENDING' || this._generationStatus === 'PROCESSING') return false;
    this._generationStatus = 'PENDING';
    this._generationError = null;
    this._updatedAt = new Date();
    this.record(new SummaryAiGenerationRequestedEvent(this.data.opportunityId, this.data.accountId, this.data.id));
    return true;
  }

  startAiGeneration(): boolean {
    if (this._generationStatus !== 'PENDING') return false;
    this._generationStatus = 'PROCESSING';
    this._generationError = null;
    this._updatedAt = new Date();
    return true;
  }

  completeAiGeneration(result: string): void {
    this.updateResult(result);
    this._generationStatus = 'COMPLETED';
    this._generationError = null;
    this._generatedAt = new Date();
  }

  failAiGeneration(message: string): void {
    this._generationStatus = 'FAILED';
    this._generationError = message;
    this._updatedAt = new Date();
    this.record(
      new OpportunityQualificationGenerationFailedEvent(
        this.data.opportunityId,
        this.data.accountId,
        'summary',
        this.data.id,
        message,
      ),
    );
  }

  toPrimitives(): Primitives {
    return {
      ...this.data,
      result: this._result,
      generationStatus: this._generationStatus,
      generationError: this._generationError,
      generatedAt: this._generatedAt,
      updatedAt: this._updatedAt,
    };
  }

  get id() {
    return this.data.id;
  }
  get accountId() {
    return this.data.accountId;
  }
  get opportunityId() {
    return this.data.opportunityId;
  }
  get summaryTemplateId() {
    return this.data.summaryTemplateId;
  }
}
