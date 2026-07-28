import { Account } from './account.entity';
import { AccountMember } from './account-member.entity';
import { InvitationToken } from './invitation-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { User } from './user.entity';
import {
  InvalidAccountMemberRoleException,
  validateAccountMemberRole,
} from '../value-objects/account-member-role.value-object';

describe('Sprint 1 auth domain', () => {
  const now = new Date('2026-07-28T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates an account with one AccountCreatedEvent and drains it once', () => {
    const account = Account.create({ id: 'account-id', name: 'Acme' });

    expect(account.pullEvents()).toEqual([expect.objectContaining({ accountId: 'account-id' })]);
    expect(account.pullEvents()).toEqual([]);
  });

  it('updates a user profile and avatar without changing omitted fields', () => {
    const user = User.create({
      id: 'user-id',
      email: 'user@example.com',
      passwordHash: 'hash',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    user.updateProfile({ firstName: 'Augusta' });
    user.updateAvatarUrl('https://example.com/avatar.png');

    expect(user.fullName).toBe('Augusta Lovelace');
    expect(user.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('changes member role and default-account status', () => {
    const member = AccountMember.create({
      id: 'member-id',
      accountId: 'account-id',
      userId: 'user-id',
      role: 'MEMBER',
      isDefault: false,
    });

    member.updateRole('ADMIN');
    member.setAsDefault();
    expect(member.role).toBe('ADMIN');
    expect(member.isDefault).toBe(true);

    member.unsetDefault();
    expect(member.isDefault).toBe(false);
  });

  it('invalidates a used invitation token', () => {
    const token = InvitationToken.create({
      id: 'invitation-id',
      accountId: 'account-id',
      email: 'user@example.com',
      role: 'MEMBER',
      tokenHash: 'hash',
      expiresAt: new Date('2026-07-29T12:00:00.000Z'),
    });

    expect(token.isValid()).toBe(true);
    token.markAsUsed();
    expect(token.isValid()).toBe(false);
  });

  it('invalidates a revoked refresh token', () => {
    const token = RefreshToken.create({
      id: 'refresh-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date('2026-07-29T12:00:00.000Z'),
    });

    expect(token.isValid()).toBe(true);
    token.revoke();
    expect(token.isValid()).toBe(false);
  });

  it('rejects expired invitation and refresh tokens', () => {
    const invitation = InvitationToken.create({
      id: 'invitation-id',
      accountId: 'account-id',
      email: 'user@example.com',
      role: 'MEMBER',
      tokenHash: 'hash',
      expiresAt: new Date('2026-07-27T12:00:00.000Z'),
    });
    const refresh = RefreshToken.create({
      id: 'refresh-id',
      userId: 'user-id',
      tokenHash: 'hash',
      expiresAt: new Date('2026-07-27T12:00:00.000Z'),
    });

    expect(invitation.isExpired()).toBe(true);
    expect(refresh.isExpired()).toBe(true);
  });

  it('validates account member roles', () => {
    expect(validateAccountMemberRole('ADMIN')).toBe('ADMIN');
    expect(() => validateAccountMemberRole('OWNER')).toThrow(InvalidAccountMemberRoleException);
  });
});
