import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IdService } from '@/shared/domain/services/id.service';
import type { Response } from 'express';
import { TokenService } from './token.service';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { AccountMemberRepository } from '../../domain/repositories/account-member.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenInvalidException } from '../../domain/exceptions/refresh-token-invalid.exception';
import type { User } from '../../domain/entities/user.entity';
import type { AuthResponseDto } from '@tfg/types';

type IssuedSession = {
  accessToken: string;
  refreshJwt: string;
  refreshTokenRecord: RefreshToken;
};

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly memberRepo: AccountMemberRepository,
    private readonly idService: IdService,
  ) {}

  async createSessionByIds(userId: string, accountId: string, res: Response): Promise<void> {
    const member = await this.memberRepo.findByUserAndAccount(userId, accountId);
    if (!member) throw new UnauthorizedException('No account membership found');

    const session = this._issueTokens(userId, accountId, member.role);
    await this.refreshTokenRepo.save(session.refreshTokenRecord);
    this.tokenService.setTokenCookies(res, session.accessToken, session.refreshJwt);
  }

  async createSession(user: User, res: Response): Promise<AuthResponseDto> {
    const defaultMember = await this.memberRepo.findDefaultByUser(user.id);
    if (!defaultMember) throw new UnauthorizedException('No account found for user');

    const session = this._issueTokens(user.id, defaultMember.accountId, defaultMember.role);
    await this.refreshTokenRepo.save(session.refreshTokenRecord);
    this.tokenService.setTokenCookies(res, session.accessToken, session.refreshJwt);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      accountId: defaultMember.accountId,
    };
  }

  async refreshSession(cookies: Record<string, string> | undefined, res: Response): Promise<void> {
    const rawToken = this.tokenService.getRefreshTokenFromCookie(cookies);
    if (!rawToken) throw new UnauthorizedException();

    let payload: { sub: string; jti: string };
    try {
      payload = this.tokenService.verifyRefreshToken(rawToken);
    } catch {
      throw new UnauthorizedException();
    }

    const hash = this.tokenService.hashToken(payload.jti);
    const existing = await this.refreshTokenRepo.findByTokenHash(hash);

    if (!existing) {
      // Token reuse detected — revoke all tokens for this user
      await this.refreshTokenRepo.revokeAllByUser(payload.sub);
      throw new UnauthorizedException('Token reuse detected');
    }

    if (!existing.isValid()) {
      throw new RefreshTokenInvalidException();
    }

    existing.revoke();
    await this.refreshTokenRepo.update(existing);

    const member = await this.memberRepo.findDefaultByUser(existing.userId);
    if (!member) throw new UnauthorizedException();

    const session = this._issueTokens(existing.userId, member.accountId, member.role);
    await this.refreshTokenRepo.save(session.refreshTokenRecord);
    this.tokenService.setTokenCookies(res, session.accessToken, session.refreshJwt);
  }

  async destroySession(cookies: Record<string, string> | undefined, res: Response): Promise<void> {
    const rawToken = this.tokenService.getRefreshTokenFromCookie(cookies);
    if (rawToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(rawToken);
        const hash = this.tokenService.hashToken(payload.jti);
        const existing = await this.refreshTokenRepo.findByTokenHash(hash);
        if (existing && !existing.isRevoked()) {
          existing.revoke();
          await this.refreshTokenRepo.update(existing);
        }
      } catch {
        // ignore invalid token on logout
      }
    }
    this.tokenService.clearTokenCookies(res);
  }

  async switchAccount(
    userId: string,
    newAccountId: string,
    cookies: Record<string, string> | undefined,
    res: Response,
  ): Promise<void> {
    const member = await this.memberRepo.findByUserAndAccount(userId, newAccountId);
    if (!member) throw new UnauthorizedException('Not a member of this account');

    await this.destroySession(cookies, res);

    await this.memberRepo.clearDefaultForUser(userId);
    member.setAsDefault();
    await this.memberRepo.save(member);

    const session = this._issueTokens(userId, newAccountId, member.role);
    await this.refreshTokenRepo.save(session.refreshTokenRecord);
    this.tokenService.setTokenCookies(res, session.accessToken, session.refreshJwt);
  }

  private _issueTokens(userId: string, accountId: string, role: 'ADMIN' | 'MEMBER'): IssuedSession {
    const accessToken = this.tokenService.signAccessToken({
      sub: userId,
      accountId,
      role,
    });
    const { token: refreshJwt, tokenId } = this.tokenService.signRefreshToken({
      sub: userId,
    });
    const tokenHash = this.tokenService.hashToken(tokenId);

    const refreshTokenRecord = RefreshToken.create({
      id: this.idService.generate(),
      userId,
      tokenHash,
      expiresAt: this.tokenService.getRefreshTokenExpiry(),
    });

    return { accessToken, refreshJwt, refreshTokenRecord };
  }
}
