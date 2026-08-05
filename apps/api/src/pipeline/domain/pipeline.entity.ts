type PipelinePrimitives = {
  id: string;
  accountId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Pipeline {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _name: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: { id: string; accountId: string; name: string }): Pipeline {
    const now = new Date();
    return new Pipeline(params.id, params.accountId, params.name, now, now);
  }

  static fromPrimitives(data: PipelinePrimitives): Pipeline {
    return new Pipeline(data.id, data.accountId, data.name, data.createdAt, data.updatedAt);
  }

  rename(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  toPrimitives(): PipelinePrimitives {
    return {
      id: this._id,
      accountId: this._accountId,
      name: this._name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get accountId(): string {
    return this._accountId;
  }
  get name(): string {
    return this._name;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
