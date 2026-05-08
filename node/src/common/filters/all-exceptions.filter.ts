import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(
        typeof body === 'string' ? { error: body } : body,
      );
      return;
    }

    const message =
      exception instanceof Error ? exception.message : String(exception);
    this.logger.error(`Unhandled exception: ${message}`, (exception as Error)?.stack);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: `An unexpected error occurred: ${message}` });
  }
}
