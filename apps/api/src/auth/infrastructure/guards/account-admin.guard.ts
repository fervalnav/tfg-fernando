import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../passport/jwt.strategy';

@Injectable()
export class AccountAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    if (request.user.role === 'ADMIN') return true;

    throw new ForbiddenException('Administrator role required');
  }
}
