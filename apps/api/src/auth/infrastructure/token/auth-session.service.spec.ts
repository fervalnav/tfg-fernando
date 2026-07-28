/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AccountMember } from '../../domain/entities/account-member.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import type { AccountMemberRepository } from '../../domain/repositories/account-member.repository';
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import type { IdService } from '@/shared/domain/services/id.service';
import { AuthSessionService } from './auth-session.service';
import type { TokenService } from './token.service';

describe('AuthSessionService', () => {
  const response = {} as Response;
  const member = AccountMember.create({
    id: 'member-id',
    accountId: 'account-id',
    userId: 'user-id',
    role: 'ADMIN',
    isDefault: true,
  });

  const createRefreshToken = (): RefreshToken =>
    RefreshToken.create({
      id: 'stored-token-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date('2099-01-01T00:00:00.000Z'),
    });

  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenRepo: jest.Mocked<RefreshTokenRepository>;
  let memberRepo: jest.Mocked<AccountMemberRepository>;
  let idService: jest.Mocked<IdService>;
  let service: AuthSessionService;

  beforeEach(() => {
    tokenService = {
      getRefreshTokenFromCookie: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashToken: jest.fn().mockReturnValue('stored-hash'),
      signAccessToken: jest.fn().mockReturnValue('access-jwt'),
      signRefreshToken: jest.fn().mockReturnValue({
        token: 'refresh-jwt',
        tokenId: 'new-token-id',
      }),
      getRefreshTokenExpiry: jest.fn().mockReturnValue(new Date('2099-01-01T00:00:00.000Z')),
      setTokenCookies: jest.fn(),
      clearTokenCookies: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;
    refreshTokenRepo = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
      update: jest.fn(),
      revokeAllByUser: jest.fn(),
    };
    memberRepo = {
      save: jest.fn(),
      findByUserAndAccount: jest.fn(),
      findDefaultByUser: jest.fn(),
      findAllByAccount: jest.fn(),
      findAllByUser: jest.fn(),
      delete: jest.fn(),
      clearDefaultForUser: jest.fn(),
    };
    idService = { generate: jest.fn().mockReturnValue('new-record-id') };
    service = new AuthSessionService(tokenService, refreshTokenRepo, memberRepo, idService);
  });

  it('creates and persists a session for a valid membership', async () => {
    memberRepo.findByUserAndAccount.mockResolvedValue(member);

    await service.createSessionByIds('user-id', 'account-id', response);

    expect(tokenService.signAccessToken).toHaveBeenCalledWith({
      sub: 'user-id',
      accountId: 'account-id',
      role: 'ADMIN',
    });
    expect(refreshTokenRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'new-record-id' }));
    expect(tokenService.setTokenCookies).toHaveBeenCalledWith(response, 'access-jwt', 'refresh-jwt');
  });

  it('rejects session creation without an account membership', async () => {
    memberRepo.findByUserAndAccount.mockResolvedValue(null);

    await expect(service.createSessionByIds('user-id', 'account-id', response)).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepo.save).not.toHaveBeenCalled();
  });

  it('rotates a valid refresh token and revokes the previous record', async () => {
    const storedToken = createRefreshToken();
    tokenService.getRefreshTokenFromCookie.mockReturnValue('raw-refresh-token');
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'user-id',
      jti: 'stored-token-id',
    });
    refreshTokenRepo.findByTokenHash.mockResolvedValue(storedToken);
    memberRepo.findDefaultByUser.mockResolvedValue(member);

    await service.refreshSession({ refresh_token: 'raw-refresh-token' }, response);

    expect(storedToken.isRevoked()).toBe(true);
    expect(refreshTokenRepo.update).toHaveBeenCalledWith(storedToken);
    expect(refreshTokenRepo.save).toHaveBeenCalled();
    expect(tokenService.setTokenCookies).toHaveBeenCalledWith(response, 'access-jwt', 'refresh-jwt');
  });

  it('revokes all user tokens when refresh-token reuse is detected', async () => {
    tokenService.getRefreshTokenFromCookie.mockReturnValue('raw-refresh-token');
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'user-id',
      jti: 'missing-token-id',
    });
    refreshTokenRepo.findByTokenHash.mockResolvedValue(null);

    await expect(service.refreshSession({ refresh_token: 'raw-refresh-token' }, response)).rejects.toThrow(
      'Token reuse detected',
    );
    expect(refreshTokenRepo.revokeAllByUser).toHaveBeenCalledWith('user-id');
  });

  it('always clears cookies on logout even when the token is invalid', async () => {
    tokenService.getRefreshTokenFromCookie.mockReturnValue('invalid-token');
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    await service.destroySession({ refresh_token: 'invalid-token' }, response);

    expect(tokenService.clearTokenCookies).toHaveBeenCalledWith(response);
    expect(refreshTokenRepo.update).not.toHaveBeenCalled();
  });

  it('switches the default account and issues a replacement session', async () => {
    const targetMember = AccountMember.create({
      id: 'target-member-id',
      accountId: 'new-account-id',
      userId: 'user-id',
      role: 'MEMBER',
      isDefault: false,
    });
    memberRepo.findByUserAndAccount.mockResolvedValue(targetMember);
    tokenService.getRefreshTokenFromCookie.mockReturnValue(null);

    await service.switchAccount('user-id', 'new-account-id', undefined, response);

    expect(memberRepo.clearDefaultForUser).toHaveBeenCalledWith('user-id');
    expect(targetMember.isDefault).toBe(true);
    expect(memberRepo.save).toHaveBeenCalledWith(targetMember);
    expect(tokenService.signAccessToken).toHaveBeenCalledWith({
      sub: 'user-id',
      accountId: 'new-account-id',
      role: 'MEMBER',
    });
  });
});
