import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { catchError, type Observable, throwError } from 'rxjs';

@Injectable()
export class HttpErrorLoggingInterceptor implements NestInterceptor<unknown, unknown> {
  private readonly logger = new Logger(HttpErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        const httpStatus = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const normalizedError = this.normalizeError(error);
        const cause = normalizedError.cause instanceof Error ? normalizedError.cause : normalizedError;

        this.logger.error(
          `[${httpStatus}] ${request.method} ${request.originalUrl} - ${cause.name}: ${cause.message}`,
          cause.stack,
        );

        return throwError(() => error);
      }),
    );
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);

    return new Error('Unknown error');
  }
}
