import type { AccountMemberRole } from '../value-objects/account-member-role.value-object';

type InvitationTokenPrimitives = {
  id: string;
  accountId: string;
  email: string;
  role: AccountMemberRole;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export class InvitationToken {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private readonly _email: string,
    private readonly _role: AccountMemberRole,
    private readonly _tokenHash: string,
    private readonly _expiresAt: Date,
    private _usedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    accountId: string;
    email: string;
    role: AccountMemberRole;
    tokenHash: string;
    expiresAt: Date;
  }): InvitationToken {
    return new InvitationToken(
      params.id,
      params.accountId,
      params.email,
      params.role,
      params.tokenHash,
      params.expiresAt,
      null,
      new Date(),
    );
  }

  static fromPrimitives(data: InvitationTokenPrimitives): InvitationToken {
    return new InvitationToken(
      data.id,
      data.accountId,
      data.email,
      data.role,
      data.tokenHash,
      data.expiresAt,
      data.usedAt,
      data.createdAt,
    );
  }

  markAsUsed(): void {
    this._usedAt = new Date();
  }

  isExpired(): boolean {
    return this._expiresAt < new Date();
  }
  isUsed(): boolean {
    return this._usedAt !== null;
  }
  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  toPrimitives(): InvitationTokenPrimitives {
    return {
      id: this._id,
      accountId: this._accountId,
      email: this._email,
      role: this._role,
      tokenHash: this._tokenHash,
      expiresAt: this._expiresAt,
      usedAt: this._usedAt,
      createdAt: this._createdAt,
    };
  }

  get id(): string {
    return this._id;
  }
  get accountId(): string {
    return this._accountId;
  }
  get email(): string {
    return this._email;
  }
  get role(): AccountMemberRole {
    return this._role;
  }
  get tokenHash(): string {
    return this._tokenHash;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get usedAt(): Date | null {
    return this._usedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
