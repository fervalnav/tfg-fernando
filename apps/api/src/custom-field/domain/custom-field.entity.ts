import type { CustomFieldType, CustomFieldValue } from '@tfg/types';

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
  createdAt: Date;
  updatedAt: Date;
};

export class CustomField {
  private constructor(
    private readonly data: Omit<Primitives, 'value' | 'updatedAt'>,
    private _value: CustomFieldValue,
    private _updatedAt: Date,
  ) {}

  static create(params: Omit<Primitives, 'value' | 'createdAt' | 'updatedAt'>): CustomField {
    const now = new Date();
    return new CustomField({ ...params, createdAt: now }, null, now);
  }

  static fromPrimitives(data: Primitives): CustomField {
    const { value, updatedAt, ...rest } = data;
    return new CustomField(rest, value, updatedAt);
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

  toPrimitives(): Primitives {
    return { ...this.data, value: this._value, updatedAt: this._updatedAt };
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
