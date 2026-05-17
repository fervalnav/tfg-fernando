import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export type JwtPayload = {
  sub: string;
  accountId: string;
  role: 'ADMIN' | 'MEMBER';
  jti: string;
};

function cookieOrBearerExtractor(req: Request): string | null {
  const fromBearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromBearer) return fromBearer;

  const cookie = req.cookies as Record<string, string> | undefined;
  return cookie?.['access_token'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.accountId) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
