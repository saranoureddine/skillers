import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlockUserDto } from '../dto/block-user.dto';
import { UnblockUserDto } from '../dto/unblock-user.dto';
import { GetBlockedUsersDto } from '../dto/get-blocked-users.dto';
import { CheckIfBlockedDto } from '../dto/check-if-blocked.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Public User Blocks Controller Documentation
// ============================================================================

export const UserBlocksPublicControllerDocs = {
  /**
   * Controller-level decorators for public user blocks controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('User Blocks'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/user-blocks/block-user - Block a user
   */
  blockUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Block user',
        description: 'Block a user by their ID. Prevents self-blocking and duplicate blocks.',
      }),
      ApiBody({ type: BlockUserDto }),
      ApiResponse({
        status: 201,
        description: 'User blocked successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User blocked successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 409, 500),
    ),

  /**
   * POST /api/public/user-blocks/unblock-user - Unblock a user
   */
  unblockUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Unblock user',
        description: 'Unblock a previously blocked user.',
      }),
      ApiBody({ type: UnblockUserDto }),
      ApiResponse({
        status: 200,
        description: 'User unblocked successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User unblocked successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/user-blocks/get-blocked-users - Get list of blocked users
   */
  getBlockedUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get blocked users',
        description: 'Retrieve a paginated list of users blocked by the authenticated user.',
      }),
      ApiBody({ type: GetBlockedUsersDto }),
      ApiResponse({
        status: 200,
        description: 'Blocked users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            blocked_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  block_id: { type: 'number', example: 1 },
                  blocked_id: { type: 'string', example: 'f98c897cbd6345478c5b' },
                  reason: { type: 'string', nullable: true, example: 'Inappropriate behavior' },
                  blocked_at: { type: 'string', format: 'date-time' },
                  user_id: { type: 'string', example: 'f98c897cbd6345478c5b' },
                  first_name: { type: 'string', example: 'John' },
                  last_name: { type: 'string', example: 'Doe' },
                  email: { type: 'string', nullable: true, example: 'john@example.com' },
                  phone_number: { type: 'string', example: '1234567' },
                  user_work: { type: 'string', nullable: true },
                  bio: { type: 'string', nullable: true },
                  average_rating: { type: 'number', example: 4.5 },
                  total_ratings: { type: 'number', example: 10 },
                  main_image: { type: 'string', nullable: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 5 },
                pages: { type: 'number', example: 1 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/user-blocks/check-if-blocked - Check if a user is blocked
   */
  checkIfBlocked: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Check if blocked',
        description: 'Check if there is a blocking relationship between the authenticated user and a target user.',
      }),
      ApiBody({ type: CheckIfBlockedDto }),
      ApiResponse({
        status: 200,
        description: 'Block status retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            you_blocked_them: { type: 'boolean', example: false },
            they_blocked_you: { type: 'boolean', example: true },
            is_mutually_blocked: { type: 'boolean', example: false },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};
