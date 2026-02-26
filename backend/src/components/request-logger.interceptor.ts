import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';

/**
 * Request Logger Interceptor
 * Logs all HTTP requests to database
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') || '';

    return next.handle().pipe(
      tap(async () => {
        try {
          const statusCode = response.statusCode;
          // Get response content (limit size to prevent huge logs)
          const content = JSON.stringify(response.body || {}).substring(0, 1000);

          await this.dataSource.query(
            `
            INSERT INTO request_log (method, url, status_code, content, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
            `,
            [method, url, statusCode, content, userAgent],
          );
        } catch (error) {
          // Don't throw - logging failure shouldn't break the request
          console.error('Failed to log request:', error.message);
        }
      }),
    );
  }
}
