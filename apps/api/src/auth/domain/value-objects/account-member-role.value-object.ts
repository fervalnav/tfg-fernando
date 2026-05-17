export const ACCOUNT_MEMBER_ROLES = ['ADMIN', 'MEMBER'] as const;
export type AccountMemberRole = (typeof ACCOUNT_MEMBER_ROLES)[number];

export class InvalidAccountMemberRoleException extends Error {
  constructor(role: string) {
    super(`Invalid account member role: ${role}`);
    this.name = 'InvalidAccountMemberRoleException';
  }
}

export function validateAccountMemberRole(role: string): AccountMemberRole {
  if (!ACCOUNT_MEMBER_ROLES.includes(role as AccountMemberRole)) {
    throw new InvalidAccountMemberRoleException(role);
  }
  return role as AccountMemberRole;
}
