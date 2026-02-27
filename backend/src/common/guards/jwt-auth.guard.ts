import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
    this.logger.log('JwtAuthGuard initialized');
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    const route = `${controller.name}.${handler.name}`;
    const method = request.method;
    const url = request.url;
    const authHeader = request.headers?.authorization;

    this.logger.debug(`[${method}] ${url} - Checking authentication for route: ${route}`);
    this.logger.debug(`Authorization header present: ${!!authHeader}`);
    if (authHeader) {
      this.logger.debug(`Authorization header: ${authHeader.substring(0, 20)}...`);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Route ${route} is public: ${isPublic}`);

    if (isPublic) {
      this.logger.debug(`[${method}] ${url} - Public route, bypassing authentication`);
      return true;
    }

    this.logger.debug(`[${method}] ${url} - Protected route, attempting JWT authentication`);
    
    try {
      const result = super.canActivate(context);
      this.logger.debug(`[${method}] ${url} - canActivate result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`[${method}] ${url} - Authentication error:`, error);
      this.logger.error(`Error stack: ${error?.stack}`);
      throw error;
    }
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    this.logger.debug(`[${method}] ${url} - handleRequest called`);
    
    if (err) {
      this.logger.error(`[${method}] ${url} - Authentication error in handleRequest:`, err);
      this.logger.error(`Error message: ${err?.message}`);
      this.logger.error(`Error stack: ${err?.stack}`);
    }

    if (info) {
      this.logger.warn(`[${method}] ${url} - Authentication info:`, info);
      this.logger.warn(`Info message: ${info?.message}`);
    }

    if (!user) {
      this.logger.warn(`[${method}] ${url} - No user found in request`);
    } else {
      const userId = (user as any)?.userId || (user as any)?.id || 'unknown';
      this.logger.debug(`[${method}] ${url} - User authenticated: ${userId}`);
    }

    if (err || !user) {
      const errorMessage = err?.message || 'Authentication required';
      this.logger.error(`[${method}] ${url} - Authentication failed: ${errorMessage}`);
      throw err || new UnauthorizedException('Authentication required');
    }

    this.logger.debug(`[${method}] ${url} - Authentication successful`);
    return user;
  }
}
