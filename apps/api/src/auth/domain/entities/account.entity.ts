type AccountPrimitives = {
  id: string;
  name: string;
  createdAt: Date;
};

export class Account {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private readonly _createdAt: Date,
  ) {}

  static create(params: { id: string; name: string }): Account {
    return new Account(params.id, params.name, new Date());
  }

  static fromPrimitives(data: AccountPrimitives): Account {
    return new Account(data.id, data.name, data.createdAt);
  }

  toPrimitives(): AccountPrimitives {
    return { id: this._id, name: this._name, createdAt: this._createdAt };
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
