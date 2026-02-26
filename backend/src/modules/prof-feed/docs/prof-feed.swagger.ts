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
  GetPersonalizedFeedDto,
  GetTimelineDto,
  FeedGetTrendingPostsDto,
  GetPostsByProfessionDto,
  GetPostsByCategoryDto,
  GetFeedRecommendationsDto,
  AdminDeletePostDto,
} from '../dto';
import {
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Public ProfFeed Controller Documentation
// ============================================================================

export const ProfFeedPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof feed controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Feed'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-feed/get-personalized-feed - Get personalized feed
   */
  getPersonalizedFeed: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get personalized feed',
        description: 'Get personalized feed for user - posts from followed users and own posts, sorted by pinned first then newest.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetPersonalizedFeedDto }),
      ApiResponse({
        status: 200,
        description: 'Personalized feed retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-feed/get-timeline - Get timeline (admin view)
   */
  getTimeline: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get timeline',
        description: 'Get timeline - Admin view of all posts sorted by newest first.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetTimelineDto }),
      ApiResponse({
        status: 200,
        description: 'Timeline retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-feed/get-trending-posts - Get trending posts
   */
  getTrendingPosts: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get trending posts',
        description: 'Get trending posts from last 7 days, ordered by engagement score.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: FeedGetTrendingPostsDto }),
      ApiResponse({
        status: 200,
        description: 'Trending posts retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-feed/get-posts-by-profession - Get posts by profession
   */
  getPostsByProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get posts by profession',
        description: 'Get posts from users with a specific profession.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetPostsByProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Posts by profession retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
   * POST /api/public/prof-feed/get-posts-by-category - Get posts by category
   */
  getPostsByCategory: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get posts by category',
        description: 'Get posts from users with professions in a specific category.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetPostsByCategoryDto }),
      ApiResponse({
        status: 200,
        description: 'Posts by category retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
   * POST /api/public/prof-feed/get-group-feed - Get group feed (disabled)
   */
  getGroupFeed: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get group feed',
        description: 'Get group feed - DISABLED: Groups not supported in current schema.',
      }),
      ApiResponse({
        status: 501,
        description: 'Group functionality not available',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: 'Group functionality not available - groups not supported in current database schema',
            },
          },
        },
      }),
    ),

  /**
   * POST /api/public/prof-feed/get-feed-recommendations - Get feed recommendations
   */
  getFeedRecommendations: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get feed recommendations',
        description: 'Get recommended posts based on user profession and interests.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetFeedRecommendationsDto }),
      ApiResponse({
        status: 200,
        description: 'Feed recommendations retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
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
      ApiErrorResponses(401, 500),
    ),
};

// ============================================================================
// Admin ProfFeed Controller Documentation
// ============================================================================

export const ProfFeedAdminControllerDocs = {
  /**
   * Controller-level decorators for admin prof feed controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Feed'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/admin/prof-feed/admin-delete-post - Admin delete post
   */
  adminDeletePost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Admin delete post',
        description: 'Admin can delete any post - no ownership check required.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: AdminDeletePostDto }),
      ApiResponse({
        status: 200,
        description: 'Post deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Post deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};
