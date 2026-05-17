type UserPrimitives = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: Date;
};

export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: string,
    private _passwordHash: string,
    private _firstName: string,
    private _lastName: string,
    private _avatarUrl: string | null,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): User {
    return new User(params.id, params.email, params.passwordHash, params.firstName, params.lastName, null, new Date());
  }

  static fromPrimitives(data: UserPrimitives): User {
    return new User(
      data.id,
      data.email,
      data.passwordHash,
      data.firstName,
      data.lastName,
      data.avatarUrl,
      data.createdAt,
    );
  }

  updateProfile(params: { firstName?: string; lastName?: string }): void {
    if (params.firstName !== undefined) this._firstName = params.firstName;
    if (params.lastName !== undefined) this._lastName = params.lastName;
  }

  updateAvatarUrl(url: string): void {
    this._avatarUrl = url;
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this._id,
      email: this._email,
      passwordHash: this._passwordHash,
      firstName: this._firstName,
      lastName: this._lastName,
      avatarUrl: this._avatarUrl,
      createdAt: this._createdAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
}
