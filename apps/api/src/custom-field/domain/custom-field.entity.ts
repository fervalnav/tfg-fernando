import type { AiGenerationStatus, CustomFieldType, CustomFieldValue } from '@tfg/types';

type Primitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  defaultCustomFieldId: string;
  name: string;
  description: string | null;
  type: CustomFieldType;
  classifiers: string[];
  canSelectMultiple: boolean;
  automatic: boolean;
  aiPrompt: string | null;
  value: CustomFieldValue;
  aiStatus: AiGenerationStatus;
  aiError: string | null;
  aiEvidence: string | null;
  aiGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class CustomField {
  private constructor(
    private readonly data: Omit<
      Primitives,
      'value' | 'aiStatus' | 'aiError' | 'aiEvidence' | 'aiGeneratedAt' | 'updatedAt'
    >,
    private _value: CustomFieldValue,
    private _aiStatus: AiGenerationStatus,
    private _aiError: string | null,
    private _aiEvidence: string | null,
    private _aiGeneratedAt: Date | null,
    private _updatedAt: Date,
  ) {}

  static create(
    params: Omit<
      Primitives,
      'value' | 'aiStatus' | 'aiError' | 'aiEvidence' | 'aiGeneratedAt' | 'createdAt' | 'updatedAt'
    >,
  ): CustomField {
    const now = new Date();
    return new CustomField({ ...params, createdAt: now }, null, 'IDLE', null, null, null, now);
  }

  static fromPrimitives(data: Primitives): CustomField {
    const { value, aiStatus, aiError, aiEvidence, aiGeneratedAt, updatedAt, ...rest } = data;
    return new CustomField(rest, value, aiStatus, aiError, aiEvidence, aiGeneratedAt, updatedAt);
  }

  setValue(value: Exclude<CustomFieldValue, null>): void {
    const isText = (this.data.type === 'TEXT' || this.data.type === 'DATE') && typeof value === 'string';
    const isNumber = this.data.type === 'NUMBER' && typeof value === 'number' && Number.isFinite(value);
    const isBoolean = this.data.type === 'BOOLEAN' && typeof value === 'boolean';
    const isSingleClassifier =
      this.data.type === 'CLASSIFIER' &&
      !this.data.canSelectMultiple &&
      typeof value === 'string' &&
      this.data.classifiers.includes(value);
    const isMultipleClassifier =
      this.data.type === 'CLASSIFIER' &&
      this.data.canSelectMultiple &&
      Array.isArray(value) &&
      value.every((item) => this.data.classifiers.includes(item));
    if (!isText && !isNumber && !isBoolean && !isSingleClassifier && !isMultipleClassifier) {
      throw new Error('El valor no coincide con la configuración del campo');
    }
    this._value = value;
    this._updatedAt = new Date();
  }

  requestAiGeneration(): boolean {
    if (this._aiStatus === 'PENDING' || this._aiStatus === 'PROCESSING') return false;
    this._aiStatus = 'PENDING';
    this._aiError = null;
    this._updatedAt = new Date();
    return true;
  }

  startAiGeneration(): boolean {
    if (this._aiStatus !== 'PENDING') return false;
    this._aiStatus = 'PROCESSING';
    this._aiError = null;
    this._updatedAt = new Date();
    return true;
  }

  completeAiGeneration(value: Exclude<CustomFieldValue, null>, evidence: string): void {
    this.setValue(value);
    this._aiStatus = 'COMPLETED';
    this._aiError = null;
    this._aiEvidence = evidence.trim();
    this._aiGeneratedAt = new Date();
  }

  failAiGeneration(message: string): void {
    this._aiStatus = 'FAILED';
    this._aiError = message;
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return {
      ...this.data,
      value: this._value,
      aiStatus: this._aiStatus,
      aiError: this._aiError,
      aiEvidence: this._aiEvidence,
      aiGeneratedAt: this._aiGeneratedAt,
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
  get defaultCustomFieldId() {
    return this.data.defaultCustomFieldId;
  }
  get value() {
    return this._value;
  }
}
