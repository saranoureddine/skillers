import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import {
  GetNotificationsDto,
  MarkAsReadDto,
  DeleteNotificationDto,
  GetNotificationsByTypeDto,
  UpdateNotificationPreferencesDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';
import { NotificationType } from '../entities/prof-notification.entity';

// ============================================================================
// Public ProfNotifications Controller Documentation
// ============================================================================

export const ProfNotificationsPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof notifications controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Notifications'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-notifications/get-notifications - Get user's notifications
   */
  getNotifications: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user notifications',
        description: 'Get user notifications and automatically mark them as read (Instagram-style).',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetNotificationsDto }),
      ApiResponse({
        status: 200,
        description: 'Notifications retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  type: { enum: Object.values(NotificationType), example: NotificationType.LIKE },
                  title: { type: 'string', example: 'New Like' },
                  message: { type: 'string', example: 'John Doe liked your post' },
                  data: { type: 'object', nullable: true },
                  is_read: { type: 'number', example: 1 },
                  read_at: { type: 'string', nullable: true },
                  created_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 100 },
                pages: { type: 'number', example: 5 },
              },
            },
            marked_as_read: { type: 'number', example: 5 },
            unread_count: { type: 'number', example: 0 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-notifications/get-unread-count - Get unread count
   */
  getUnreadCount: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get unread notifications count',
        description: 'Get the count of unread notifications for the authenticated user.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'Unread count retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            unread_count: { type: 'number', example: 5 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-notifications/mark-as-read - Mark notification as read
   */
  markAsRead: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Mark notification as read',
        description: 'Mark a specific notification as read.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: MarkAsReadDto }),
      ApiResponse({
        status: 200,
        description: 'Notification marked as read successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification marked as read' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-notifications/mark-all-as-read - Mark all as read
   */
  markAllAsRead: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Mark all notifications as read',
        description: 'Mark all unread notifications as read for the authenticated user.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'All notifications marked as read successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'All notifications marked as read' },
            updated_count: { type: 'number', example: 10 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-notifications/delete-notification - Delete notification
   */
  deleteNotification: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete notification',
        description: 'Delete a specific notification.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: DeleteNotificationDto }),
      ApiResponse({
        status: 200,
        description: 'Notification deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-notifications/clear-all-notifications - Clear all notifications
   */
  clearAllNotifications: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Clear all notifications',
        description: 'Delete all notifications for the authenticated user.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'All notifications cleared successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'All notifications cleared' },
            deleted_count: { type: 'number', example: 50 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-notifications/get-notifications-by-type - Get notifications by type
   */
  getNotificationsByType: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get notifications by type',
        description: 'Get notifications filtered by type (like, comment, follow, etc.).',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetNotificationsByTypeDto }),
      ApiResponse({
        status: 200,
        description: 'Notifications by type retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            notifications: {
              type: 'array',
              items: { type: 'object' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 100 },
                pages: { type: 'number', example: 5 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-notifications/get-notification-preferences - Get notification preferences
   */
  getNotificationPreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get notification preferences',
        description: 'Get user notification preferences (receive_notifications, receive_calls, etc.).',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'Notification preferences retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            preferences: {
              type: 'object',
              properties: {
                receive_notifications: { type: 'boolean', example: true },
                receive_calls: { type: 'boolean', example: false },
                receive_offers: { type: 'boolean', example: false },
                receive_updates: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/prof-notifications/update-notification-preferences - Update notification preferences
   */
  updateNotificationPreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update notification preferences',
        description: 'Update user notification preferences.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: UpdateNotificationPreferencesDto }),
      ApiResponse({
        status: 200,
        description: 'Notification preferences updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Notification preferences updated successfully' },
            preferences: {
              type: 'object',
              properties: {
                receive_notifications: { type: 'boolean', example: true },
                receive_calls: { type: 'boolean', example: false },
                receive_offers: { type: 'boolean', example: false },
                receive_updates: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};
