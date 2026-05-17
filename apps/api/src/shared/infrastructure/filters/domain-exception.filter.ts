import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.resolveStatus(exception.code);

    this.logger.warn(`[${exception.code}] ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
    });
  }

  private resolveStatus(code: string): number {
    if (code.includes('NOT_FOUND')) return HttpStatus.NOT_FOUND;
    if (code.includes('ALREADY_EXISTS')) return HttpStatus.CONFLICT;
    if (code.includes('FORBIDDEN')) return HttpStatus.FORBIDDEN;
    if (code.includes('UNAUTHORIZED')) return HttpStatus.UNAUTHORIZED;
    if (code.includes('INVALID')) return HttpStatus.UNPROCESSABLE_ENTITY;
    return HttpStatus.BAD_REQUEST;
  }
}
