type WorkflowPrimitives = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Workflow {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private _name: string,
    private _description: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: { id: string; accountId: string; name: string; description?: string }): Workflow {
    const now = new Date();
    return new Workflow(params.id, params.accountId, params.name, params.description ?? null, now, now);
  }

  static fromPrimitives(data: WorkflowPrimitives): Workflow {
    return new Workflow(data.id, data.accountId, data.name, data.description, data.createdAt, data.updatedAt);
  }

  update(name: string, description: string | null): void {
    this._name = name;
    this._description = description;
    this._updatedAt = new Date();
  }

  toPrimitives(): WorkflowPrimitives {
    return {
      id: this._id,
      accountId: this._accountId,
      name: this._name,
      description: this._description,
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
  get description(): string | null {
    return this._description;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
