import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

/**
 * Access Control Guard
 * Equivalent to Yii AccessControl component
 * Ensures user is authenticated (not a guest)
 * 
 * In Yii: Checks if Yii::$app->user->isGuest and redirects to login
 * In NestJS: Checks if user is authenticated and throws UnauthorizedException
 */
@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Equivalent to Yii: if (Yii::$app->user->isGuest)
    // In NestJS, if user is null/undefined, they are a guest (not authenticated)
    if (!user) {
      // Equivalent to Yii: Yii::$app->session->setFlash('warning', 'Please login to access this page.');
      // Equivalent to Yii: Yii::$app->user->loginRequired();
      // In NestJS, we throw UnauthorizedException which returns 401 status
      throw new UnauthorizedException('Please login to access this page.');
    }

    // Additional check: if user object has isGuest flag set to true
    if (user.isGuest === true || user.isGuest === 1 || user.is_guest === true || user.is_guest === 1) {
      throw new UnauthorizedException('Please login to access this page.');
    }

    // Equivalent to Yii: return true (action can proceed)
    return true;
  }
}
