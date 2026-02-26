import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfLikeEntity } from '../entities/prof-like.entity';
import { LikeDto } from '../dto/like.dto';
import { GetLikesDto } from '../dto/get-likes.dto';
import { GetUserLikesDto } from '../dto/get-user-likes.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Prof Likes Controller Documentation
// ============================================================================

export const ProfLikesControllerDocs = {
  /**
   * Controller-level decorators for shared prof likes controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Likes'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/prof-likes/:id - Get like by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get like by ID',
        description: 'Retrieve a single like by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Like ID',
        example: 1,
      }),
      ApiItemResponse(ProfLikeEntity, 'Like retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Prof Likes Controller Documentation
// ============================================================================

export const ProfLikesPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof likes controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Likes'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-likes/like - Like a post or comment
   */
  like: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Like a post or comment',
        description: 'Like a post or comment. Updates likes_count and sends notification to owner.',
      }),
      ApiBody({ type: LikeDto }),
      ApiResponse({
        status: 201,
        description: 'Liked successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Liked successfully' },
            debug: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 409, 500),
    ),

  /**
   * POST /api/public/prof-likes/unlike - Unlike a post or comment
   */
  unlike: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Unlike a post or comment',
        description: 'Remove a like from a post or comment. Updates likes_count.',
      }),
      ApiBody({ type: LikeDto }),
      ApiResponse({
        status: 200,
        description: 'Unliked successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Unliked successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-likes/toggle-like - Toggle like
   */
  toggleLike: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Toggle like',
        description: 'Like if not liked, unlike if already liked. Updates likes_count and sends notification when liking.',
      }),
      ApiBody({ type: LikeDto }),
      ApiResponse({
        status: 200,
        description: 'Like toggled successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Liked successfully' },
            is_liked: { type: 'boolean', example: true },
            debug: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-likes/get-likes - Get likes for a post or comment
   */
  getLikes: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get likes for a post or comment',
        description: 'Retrieve paginated list of users who liked a post or comment.',
      }),
      ApiBody({ type: GetLikesDto }),
      ApiResponse({
        status: 200,
        description: 'Likes retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            likes: {
              type: 'array',
              items: { type: 'object' },
            },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-likes/get-user-likes - Get user's likes
   */
  getUserLikes: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user\'s likes',
        description: 'Retrieve paginated list of items liked by a user.',
      }),
      ApiBody({ type: GetUserLikesDto }),
      ApiResponse({
        status: 200,
        description: 'User likes retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            likes: {
              type: 'array',
              items: { type: 'object' },
            },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-likes/check-like - Check if user has liked
   */
  checkLike: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Check if user has liked',
        description: 'Check if the authenticated user has liked a specific post or comment.',
      }),
      ApiBody({ type: LikeDto }),
      ApiResponse({
        status: 200,
        description: 'Like status retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            is_liked: { type: 'boolean', example: true },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};

// ============================================================================
// Admin Prof Likes Controller Documentation
// ============================================================================

export const ProfLikesAdminControllerDocs = {
  /**
   * Controller-level decorators for admin prof likes controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Likes'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/prof-likes/get-all - Get all likes (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all likes',
        description: 'Retrieve all likes. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Likes retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfLikeEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/prof-likes/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get likes statistics',
        description: 'Get statistics about likes. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 1000 },
            post_likes: { type: 'number', example: 700 },
            comment_likes: { type: 'number', example: 300 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
