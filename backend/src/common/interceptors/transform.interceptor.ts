import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Global interceptor that wraps all successful responses
 * in a consistent { success, data, timestamp } envelope.
 * 
 * If the response already has a `success` field (Yii-compatible format),
 * it returns it as-is without wrapping.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | any> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | any> {
    return next.handle().pipe(
      map((data) => {
        // If data already has a `success` field (Yii-compatible format), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        // Otherwise, wrap in standard format
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
