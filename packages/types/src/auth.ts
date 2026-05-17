export type UserDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type AccountDto = {
  id: string;
  name: string;
  createdAt: string;
};

export type AccountMemberDto = {
  id: string;
  userId: string;
  accountId: string;
  role: 'ADMIN' | 'MEMBER';
  isDefault: boolean;
  user: UserDto;
};

export type AuthResponseDto = {
  user: UserDto;
  accountId: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountName: string;
};

export type InviteMemberPayload = {
  email: string;
  role: 'ADMIN' | 'MEMBER';
};

export type AcceptInvitationPayload = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
};

export type SwitchAccountPayload = {
  accountId: string;
};

export type UpdateMemberRolePayload = {
  role: 'ADMIN' | 'MEMBER';
};
