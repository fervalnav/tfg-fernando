type Primitives = {
  id: string;
  accountId: string;
  opportunityId: string;
  summaryTemplateId: string;
  name: string;
  prompt: string;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Summary {
  private constructor(
    private readonly data: Omit<Primitives, 'result' | 'updatedAt'>,
    private _result: string | null,
    private _updatedAt: Date,
  ) {}

  static create(params: Omit<Primitives, 'result' | 'createdAt' | 'updatedAt'>): Summary {
    const now = new Date();
    return new Summary({ ...params, createdAt: now }, null, now);
  }

  static fromPrimitives(data: Primitives): Summary {
    const { result, updatedAt, ...rest } = data;
    return new Summary(rest, result, updatedAt);
  }

  updateResult(result: string): void {
    if (!result.trim()) throw new Error('El resumen no puede estar vacío');
    this._result = result.trim();
    this._updatedAt = new Date();
  }

  toPrimitives(): Primitives {
    return { ...this.data, result: this._result, updatedAt: this._updatedAt };
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
