import { AggregateRoot } from '@/shared/domain/aggregate-root';

export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'CLASSIFIER';

type Primitives = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  type: CustomFieldType;
  classifiers: string[];
  canSelectMultiple: boolean;
  automatic: boolean;
  aiPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class DefaultCustomField extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _name: string,
    private _description: string | null,
    private _type: CustomFieldType,
    private _classifiers: string[],
    private _canSelectMultiple: boolean,
    private _automatic: boolean,
    private _aiPrompt: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(params: {
    id: string;
    accountId: string;
    name: string;
    description?: string;
    type: CustomFieldType;
    classifiers?: string[];
    canSelectMultiple?: boolean;
    automatic?: boolean;
    aiPrompt?: string;
  }): DefaultCustomField {
    const now = new Date();
    return new DefaultCustomField(
      params.id,
      params.accountId,
      params.name,
      params.description ?? null,
      params.type,
      params.classifiers ?? [],
      params.canSelectMultiple ?? false,
      params.automatic ?? false,
      params.aiPrompt ?? null,
      now,
      now,
    );
  }

  static fromPrimitives(data: Primitives): DefaultCustomField {
    return new DefaultCustomField(
      data.id,
      data.accountId,
      data.name,
      data.description,
      data.type,
      data.classifiers,
      data.canSelectMultiple,
      data.automatic,
      data.aiPrompt,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(params: {
    name?: string;
    description?: string | null;
    type?: CustomFieldType;
    classifiers?: string[];
    canSelectMultiple?: boolean;
    automatic?: boolean;
    aiPrompt?: string | null;
  }): void {
    if (params.name !== undefined) this._name = params.name;
    if (params.description !== undefined) this._description = params.description;
    if (params.type !== undefined) this._type = params.type;
    if (params.classifiers !== undefined) this._classifiers = params.classifiers;
    if (params.canSelectMultiple !== undefined) this._canSelectMultiple = params.canSelectMultiple;
    if (params.automatic !== undefined) this._automatic = params.automatic;
    if (params.aiPrompt !== undefined) this._aiPrompt = params.aiPrompt;
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return {
      id: this._id,
      accountId: this._accountId,
      name: this._name,
      description: this._description,
      type: this._type,
      classifiers: this._classifiers,
      canSelectMultiple: this._canSelectMultiple,
      automatic: this._automatic,
      aiPrompt: this._aiPrompt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id() {
    return this._id;
  }
  get accountId() {
    return this._accountId;
  }
  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  get type() {
    return this._type;
  }
  get classifiers() {
    return this._classifiers;
  }
  get canSelectMultiple() {
    return this._canSelectMultiple;
  }
  get automatic() {
    return this._automatic;
  }
  get aiPrompt() {
    return this._aiPrompt;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
