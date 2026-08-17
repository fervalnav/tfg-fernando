import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import type { AccountMemberRole } from '../../domain/value-objects/account-member-role.value-object';

export type AccessTokenPayload = {
  sub: string;
  accountId: string;
  role: AccountMemberRole;
  jti: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export type InvitationTokenPayload = {
  jti: string;
  email: string;
  accountId: string;
  role: AccountMemberRole;
};

const REFRESH_COOKIE = 'refresh_token';
const ACCESS_COOKIE = 'access_token';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): string {
    return this.jwt.sign({ ...payload, jti: uuidv4() } satisfies AccessTokenPayload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),

      expiresIn: this.config.get('JWT_EXPIRES_IN', '1h'),
    });
  }

  signRefreshToken(payload: Omit<RefreshTokenPayload, 'jti'>): {
    token: string;
    tokenId: string;
  } {
    const tokenId = uuidv4();
    const token = this.jwt.sign({ ...payload, jti: tokenId } satisfies RefreshTokenPayload, {
      secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),

      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN', '30d'),
    });
    return { token, tokenId };
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify<RefreshTokenPayload>(token, {
      secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
    });
  }

  signInvitationToken(payload: InvitationTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      expiresIn: '7d' as any,
    });
  }

  verifyInvitationToken(token: string): InvitationTokenPayload {
    return this.jwt.verify<InvitationTokenPayload>(token, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  hashToken(tokenId: string): string {
    return createHash('sha256').update(tokenId).digest('hex');
  }

  getRefreshTokenExpiry(): Date {
    const days = 30;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });
  }

  clearTokenCookies(res: Response): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const cookieOptions = { sameSite: 'lax' as const, secure: isProd, path: '/' };
    res.clearCookie(ACCESS_COOKIE, { ...cookieOptions, httpOnly: true });
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, httpOnly: true });
  }

  getRefreshTokenFromCookie(cookies: Record<string, string> | undefined): string | null {
    return cookies?.[REFRESH_COOKIE] ?? null;
  }
}
