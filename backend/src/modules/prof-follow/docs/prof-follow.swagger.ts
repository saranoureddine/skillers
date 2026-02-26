import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfFollowEntity } from '../entities/prof-follow.entity';
import { FollowUserDto } from '../dto/follow-user.dto';
import { UnfollowUserDto } from '../dto/unfollow-user.dto';
import { FollowBlockUserDto } from '../dto/block-user.dto';
import { FollowUnblockUserDto } from '../dto/unblock-user.dto';
import { MuteUserDto } from '../dto/mute-user.dto';
import { UnmuteUserDto } from '../dto/unmute-user.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';
import { GetFollowingDto } from '../dto/get-following.dto';
import { GetFollowStatusDto } from '../dto/get-follow-status.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Prof Follow Controller Documentation
// ============================================================================

export const ProfFollowControllerDocs = {
  /**
   * Controller-level decorators for shared prof follow controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Follow'),
      ApiBearerAuth('Token-auth'),
    ),
};

// ============================================================================
// Public Prof Follow Controller Documentation
// ============================================================================

export const ProfFollowPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof follow controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Follow'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-follow/follow-user - Follow a user
   */
  followUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Follow a user',
        description: 'Follow a user. Creates a follow relationship and sends a notification to the followed user.',
      }),
      ApiBody({ type: FollowUserDto }),
      ApiResponse({
        status: 201,
        description: 'User followed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User followed successfully' },
            debug: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 409, 500),
    ),

  /**
   * POST /api/public/prof-follow/unfollow-user - Unfollow a user
   */
  unfollowUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Unfollow a user',
        description: 'Unfollow a user. Deletes the follow relationship completely.',
      }),
      ApiBody({ type: UnfollowUserDto }),
      ApiResponse({
        status: 200,
        description: 'User unfollowed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User unfollowed successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-follow/block-user - Block a user
   */
  blockUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Block a user',
        description: 'Block a user. If they were following, decrements follow counts.',
      }),
      ApiBody({ type: FollowBlockUserDto }),
      ApiResponse({
        status: 200,
        description: 'User blocked successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User blocked successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-follow/unblock-user - Unblock a user
   */
  unblockUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Unblock a user',
        description: 'Unblock a user. Deletes the block relationship completely.',
      }),
      ApiBody({ type: FollowUnblockUserDto }),
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
   * POST /api/public/prof-follow/mute-user - Mute a user
   */
  muteUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Mute a user',
        description: 'Mute a user (stop seeing their posts but keep following). If not following, increments follow counts.',
      }),
      ApiBody({ type: MuteUserDto }),
      ApiResponse({
        status: 200,
        description: 'User muted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User muted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-follow/unmute-user - Unmute a user
   */
  unmuteUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Unmute a user',
        description: 'Unmute a user. Changes status back to following.',
      }),
      ApiBody({ type: UnmuteUserDto }),
      ApiResponse({
        status: 200,
        description: 'User unmuted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User unmuted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-follow/get-followers - Get user's followers
   */
  getFollowers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user\'s followers',
        description: 'Retrieve paginated list of users who follow a specific user.',
      }),
      ApiBody({ type: GetFollowersDto }),
      ApiResponse({
        status: 200,
        description: 'Followers retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            followers: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-follow/get-following - Get users that the user is following
   */
  getFollowing: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get users that the user is following',
        description: 'Retrieve paginated list of users that a specific user is following.',
      }),
      ApiBody({ type: GetFollowingDto }),
      ApiResponse({
        status: 200,
        description: 'Following retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            following: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-follow/get-follow-status - Check follow status between users
   */
  getFollowStatus: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Check follow status between users',
        description: 'Get the follow relationship status between the current user and a target user.',
      }),
      ApiBody({ type: GetFollowStatusDto }),
      ApiResponse({
        status: 200,
        description: 'Follow status retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            status: {
              type: 'object',
              properties: {
                is_following: { type: 'string', nullable: true, example: 'following' },
                is_followed_by: { type: 'string', nullable: true, example: 'following' },
                is_mutual: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};

// ============================================================================
// Admin Prof Follow Controller Documentation
// ============================================================================

export const ProfFollowAdminControllerDocs = {
  /**
   * Controller-level decorators for admin prof follow controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Follow'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/prof-follow/get-all - Get all follow relationships (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all follow relationships',
        description: 'Retrieve all follow relationships. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Follow relationships retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfFollowEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/prof-follow/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get follow statistics',
        description: 'Get statistics about follow relationships. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 1000 },
            following: { type: 'number', example: 800 },
            blocked: { type: 'number', example: 150 },
            muted: { type: 'number', example: 50 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
