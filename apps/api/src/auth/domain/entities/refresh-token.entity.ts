type RefreshTokenPrimitives = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export class RefreshToken {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _tokenHash: string,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static create(params: { id: string; userId: string; tokenHash: string; expiresAt: Date }): RefreshToken {
    return new RefreshToken(params.id, params.userId, params.tokenHash, params.expiresAt, null, new Date());
  }

  static fromPrimitives(data: RefreshTokenPrimitives): RefreshToken {
    return new RefreshToken(data.id, data.userId, data.tokenHash, data.expiresAt, data.revokedAt, data.createdAt);
  }

  revoke(): void {
    this._revokedAt = new Date();
  }

  isExpired(): boolean {
    return this._expiresAt < new Date();
  }
  isRevoked(): boolean {
    return this._revokedAt !== null;
  }
  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  toPrimitives(): RefreshTokenPrimitives {
    return {
      id: this._id,
      userId: this._userId,
      tokenHash: this._tokenHash,
      expiresAt: this._expiresAt,
      revokedAt: this._revokedAt,
      createdAt: this._createdAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get tokenHash(): string {
    return this._tokenHash;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get revokedAt(): Date | null {
    return this._revokedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
