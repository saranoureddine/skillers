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

    // Log full error details
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;
    
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${errorMessage}`,
    );
    
    if (errorStack) {
      this.logger.error(`Error stack: ${errorStack}`);
    }
    
    // Log additional error details for debugging
    if (exception instanceof Error) {
      this.logger.error(`Error name: ${exception.name}`);
      if ((exception as any).cause) {
        this.logger.error(`Error cause: ${(exception as any).cause}`);
      }
    }

    // Default error format (for non-Yii-compatible exceptions)
    // Include error message in response for debugging (remove in production if needed)
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : errorMessage,
      ...(process.env.NODE_ENV !== 'production' && {
        error: errorMessage,
        stack: errorStack,
      }),
    });
  }
}
