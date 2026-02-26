import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatBlockedUserEntity } from '../entities/chat-blocked-user.entity';
import { CreateChatBlockedUserDto } from '../dto/create-chat-blocked-user.dto';
import { UpdateChatBlockedUserDto } from '../dto/update-chat-blocked-user.dto';
import { ToggleBlockDto } from '../dto/toggle-block.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Chat Blocked Users Controller Documentation
// ============================================================================

export const ChatBlockedUsersControllerDocs = {
  /**
   * Controller-level decorators for shared chat blocked users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Blocked Users'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/chat-blocked-users/:id - Get blocked user by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get blocked user by ID',
        description: 'Retrieve a single blocked user record by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Blocked user record ID',
        example: 1,
      }),
      ApiItemResponse(ChatBlockedUserEntity, 'Blocked user retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Chat Blocked Users Controller Documentation
// ============================================================================

export const ChatBlockedUsersPublicControllerDocs = {
  /**
   * Controller-level decorators for public chat blocked users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Blocked Users'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/chat-blocked-users/get-all-blocked - Get all blocked users
   */
  getAllBlocked: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all blocked users',
        description: 'Retrieve all blocked user records. Accessible by authenticated users.',
      }),
      ApiResponse({
        status: 200,
        description: 'Blocked users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            blocked_users: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatBlockedUserEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * GET /api/public/chat-blocked-users/get-blocked-by-id/:id - Get blocked user by ID
   */
  getBlockedById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get blocked user by ID',
        description: 'Retrieve a single blocked user record by its ID.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Blocked user record ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Blocked user retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            blocked_user: { $ref: '#/components/schemas/ChatBlockedUserEntity' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/chat-blocked-users/create-blocked - Create blocked user
   */
  createBlocked: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create blocked user',
        description: 'Create a new blocked user record.',
      }),
      ApiBody({ type: CreateChatBlockedUserDto }),
      ApiResponse({
        status: 200,
        description: 'Blocked user created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Blocked user created successfully' },
            blocked_user: { $ref: '#/components/schemas/ChatBlockedUserEntity' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 409, 500),
    ),

  /**
   * PATCH /api/public/chat-blocked-users/update-blocked/:id - Update blocked user
   */
  updateBlocked: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update blocked user',
        description: 'Update a blocked user record.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Blocked user record ID',
        example: 1,
      }),
      ApiBody({ type: UpdateChatBlockedUserDto }),
      ApiResponse({
        status: 200,
        description: 'Blocked user updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Blocked user updated successfully' },
            blocked_user: { $ref: '#/components/schemas/ChatBlockedUserEntity' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * DELETE /api/public/chat-blocked-users/delete-blocked/:id - Delete blocked user
   */
  deleteBlocked: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete blocked user',
        description: 'Delete a blocked user record (unblock user).',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Blocked user record ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Blocked user deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Blocked user deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/chat-blocked-users/toggle-block - Toggle block/unblock user
   */
  toggleBlock: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Toggle block/unblock user',
        description: 'Block or unblock a user. If user is already blocked, unblocks them. If not blocked, blocks them. Includes Centrifugo broadcast.',
      }),
      ApiBody({ type: ToggleBlockDto }),
      ApiResponse({
        status: 200,
        description: 'Block status toggled successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User blocked successfully' },
            is_blocked: { type: 'boolean', example: true },
            blocker_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            blocked_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            event_type: { type: 'string', example: 'user_blocked', enum: ['user_blocked', 'user_unblocked'] },
            timestamp: { type: 'string', format: 'date-time' },
            broadcast_status: {
              type: 'object',
              properties: {
                attempted: { type: 'boolean', example: true },
                success: { type: 'boolean', example: true },
                channel: { type: 'string', example: 'skillers_507f1f77bcf86cd799439012' },
                error: { type: 'string', nullable: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Admin Chat Blocked Users Controller Documentation
// ============================================================================

export const ChatBlockedUsersAdminControllerDocs = {
  /**
   * Controller-level decorators for admin chat blocked users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Chat Blocked Users'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/chat-blocked-users/get-all - Get all blocked users (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all blocked users',
        description: 'Retrieve all blocked user records. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Blocked users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChatBlockedUserEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/chat-blocked-users/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get blocked users statistics',
        description: 'Get statistics about blocked users. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 50 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
