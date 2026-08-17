import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { TokenService } from './token.service';

describe('TokenService cookies', () => {
  it('uses secure HttpOnly same-origin cookies in production', () => {
    const service = new TokenService({} as JwtService, config('production'));
    const cookie = jest.fn();
    const clearCookie = jest.fn();
    const response = {
      cookie,
      clearCookie,
    } as unknown as Response;

    service.setTokenCookies(response, 'access', 'refresh');
    service.clearTokenCookies(response);

    expect(cookie).toHaveBeenNthCalledWith(
      1,
      'access_token',
      'access',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', secure: true, path: '/' }),
    );
    expect(cookie).toHaveBeenNthCalledWith(
      2,
      'refresh_token',
      'refresh',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', secure: true, path: '/' }),
    );
    expect(clearCookie).toHaveBeenCalledTimes(2);
  });
});

function config(environment: string): ConfigService {
  return {
    get: jest.fn((key: string) => (key === 'NODE_ENV' ? environment : undefined)),
  } as unknown as ConfigService;
}
