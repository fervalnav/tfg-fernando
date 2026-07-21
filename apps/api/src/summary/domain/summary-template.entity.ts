import { AggregateRoot } from '@/shared/domain/aggregate-root';

type Primitives = {
  id: string;
  accountId: string;
  name: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
};

export class SummaryTemplate extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _name: string,
    private _prompt: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(params: { id: string; accountId: string; name: string; prompt: string }): SummaryTemplate {
    const now = new Date();
    return new SummaryTemplate(params.id, params.accountId, params.name, params.prompt, now, now);
  }

  static fromPrimitives(data: Primitives): SummaryTemplate {
    return new SummaryTemplate(data.id, data.accountId, data.name, data.prompt, data.createdAt, data.updatedAt);
  }

  update(params: { name?: string; prompt?: string }): void {
    if (params.name !== undefined) this._name = params.name;
    if (params.prompt !== undefined) this._prompt = params.prompt;
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return {
      id: this._id,
      accountId: this._accountId,
      name: this._name,
      prompt: this._prompt,
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
  get prompt() {
    return this._prompt;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
