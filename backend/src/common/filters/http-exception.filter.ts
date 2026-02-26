import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Check if exception response already has Yii-compatible format (has 'success' field)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'success' in exceptionResponse
      ) {
        // Return Yii-compatible format as-is
        this.logger.error(
          `[${request.method}] ${request.url} - ${status}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
        response.status(status).json(exceptionResponse);
        return;
      }

      // Handle validation errors (BadRequestException with errors array)
      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'errors' in exceptionResponse
      ) {
        const errorObj = exceptionResponse as any;
        this.logger.error(
          `[${request.method}] ${request.url} - ${status}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
        response.status(status).json({
          success: false,
          message: errorObj.message || 'Validation failed',
          errors: errorObj.errors,
        });
        return;
      }

      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exceptionResponse;
    }

    this.logger.error(
      `[${request.method}] ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Default error format (for non-Yii-compatible exceptions)
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    });
  }
}
