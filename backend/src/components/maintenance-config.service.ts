import { Injectable } from '@nestjs/common';

/**
 * Maintenance Config Service
 * Central configuration for maintenance mode
 */
@Injectable()
export class MaintenanceConfigService {
  /** Seconds clients should wait before retrying (used in Retry-After header) */
  readonly RETRY_AFTER_SECONDS = 120;

  /** Default user-facing maintenance message */
  readonly DEFAULT_MESSAGE = 'We are performing scheduled maintenance. Please try again shortly.';

  /**
   * Endpoints that should NEVER be blocked by maintenance.
   * Prefix match (starts-with) is used in the middleware.
   */
  readonly exemptEndpoints: string[] = [
    '/health',
    '/ping',
    '/api/public/users/login',
    '/api/public/users/register',
    '/api/tenants/maintenance-status',
    '/api/tenants/cache-stats',
  ];

  /**
   * IPs that can bypass maintenance.
   */
  readonly allowedIPs: string[] = [
    '127.0.0.1',
    '::1',
    // Add office/public IPs here if needed
  ];

  /**
   * Role IDs allowed to bypass maintenance.
   */
  readonly allowedRoles: number[] = [
    1, // Super Admin
    2, // Admin
  ];

  /**
   * Specific user IDs allowed to bypass maintenance.
   */
  readonly allowedUserIds: string[] = [
    '1',
    // Add more user IDs as needed
  ];
}
