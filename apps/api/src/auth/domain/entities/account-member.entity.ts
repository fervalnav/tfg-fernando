import type { AccountMemberRole } from '../value-objects/account-member-role.value-object';

type AccountMemberPrimitives = {
  id: string;
  accountId: string;
  userId: string;
  role: AccountMemberRole;
  isDefault: boolean;
  createdAt: Date;
};

export class AccountMember {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private readonly _userId: string,
    private _role: AccountMemberRole,
    private _isDefault: boolean,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    accountId: string;
    userId: string;
    role: AccountMemberRole;
    isDefault: boolean;
  }): AccountMember {
    return new AccountMember(params.id, params.accountId, params.userId, params.role, params.isDefault, new Date());
  }

  static fromPrimitives(data: AccountMemberPrimitives): AccountMember {
    return new AccountMember(data.id, data.accountId, data.userId, data.role, data.isDefault, data.createdAt);
  }

  setAsDefault(): void {
    this._isDefault = true;
  }

  unsetDefault(): void {
    this._isDefault = false;
  }

  updateRole(role: AccountMemberRole): void {
    this._role = role;
  }

  toPrimitives(): AccountMemberPrimitives {
    return {
      id: this._id,
      accountId: this._accountId,
      userId: this._userId,
      role: this._role,
      isDefault: this._isDefault,
      createdAt: this._createdAt,
    };
  }

  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get userId(): string {
    return this._userId;
  }

  get role(): AccountMemberRole {
    return this._role;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
