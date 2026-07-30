import { BadRequestException, type CallHandler, type ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, throwError } from 'rxjs';
import { HttpErrorLoggingInterceptor } from './http-error-logging.interceptor';

describe('HttpErrorLoggingInterceptor', () => {
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        originalUrl: '/api/opportunities/opportunity-id/attachments',
      }),
    }),
  } as unknown as ExecutionContext;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs and rethrows an unexpected error with request context and stack', async () => {
    const error = new TypeError('Cannot read attachment');
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const next = {
      handle: () => throwError(() => error),
    } as CallHandler<unknown>;

    await expect(lastValueFrom(new HttpErrorLoggingInterceptor().intercept(context, next))).rejects.toBe(error);

    expect(logger).toHaveBeenCalledWith(
      '[500] GET /api/opportunities/opportunity-id/attachments - TypeError: Cannot read attachment',
      error.stack,
    );
  });

  it('logs HTTP exceptions without changing their status or response', async () => {
    const error = new BadRequestException('Invalid attachment');
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const next = {
      handle: () => throwError(() => error),
    } as CallHandler<unknown>;

    await expect(lastValueFrom(new HttpErrorLoggingInterceptor().intercept(context, next))).rejects.toBe(error);

    expect(logger).toHaveBeenCalledWith(
      '[400] GET /api/opportunities/opportunity-id/attachments - BadRequestException: Invalid attachment',
      error.stack,
    );
  });
});
