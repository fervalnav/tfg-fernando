import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AccountAdminGuard } from './account-admin.guard';
import type { JwtPayload } from '../passport/jwt.strategy';

describe('AccountAdminGuard', () => {
  const guard = new AccountAdminGuard();

  it('allows administrators', () => {
    expect(guard.canActivate(contextFor('ADMIN'))).toBe(true);
  });

  it('rejects members', () => {
    expect(() => guard.canActivate(contextFor('MEMBER'))).toThrow(ForbiddenException);
  });
});

function contextFor(role: JwtPayload['role']): ExecutionContext {
  const user: JwtPayload = {
    sub: '0198f6b3-1fd7-7fba-8e79-53161b649920',
    accountId: '0198f6b3-1fd7-7fba-8e79-53161b649921',
    role,
    jti: '0198f6b3-1fd7-7fba-8e79-53161b649922',
  };
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}
