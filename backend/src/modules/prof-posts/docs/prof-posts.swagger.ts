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
  CreatePostDto,
  UpdatePostDto,
  GetUserPostsDto,
  GetPostDto,
  DeletePostDto,
  PinPostDto,
  GetFeedDto,
  GetTrendingPostsDto,
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  GetPostCommentsDto,
  GetCommentRepliesDto,
  GetUserCommentsDto,
} from '../dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';
import { PostType } from '../entities/prof-post.entity';

// ============================================================================
// Public ProfPosts Controller Documentation
// ============================================================================

export const ProfPostsPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof posts controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Posts'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-posts/create-post - Create a new professional post
   */
  createPost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a new professional post',
        description: 'Creates a new post with content, description, type, and optional attachment.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: CreatePostDto }),
      ApiResponse({
        status: 201,
        description: 'Post created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Post created successfully' },
            post_id: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-posts/get-user-posts - Get user's posts with pagination
   */
  getUserPosts: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user posts',
        description: 'Retrieve posts for a specific user (or current user) with pagination.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetUserPostsDto }),
      ApiResponse({
        status: 200,
        description: 'Posts retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  content: { type: 'string', example: 'This is my first professional post!' },
                  description: { type: 'string', example: 'Additional details' },
                  post_type: { enum: Object.values(PostType), example: PostType.TEXT },
                  likes_count: { type: 'number', example: 10 },
                  comments_count: { type: 'number', example: 5 },
                  shares_count: { type: 'number', example: 2 },
                  views_count: { type: 'number', example: 100 },
                  is_pinned: { type: 'number', example: 0 },
                  pinned_at: { type: 'string', nullable: true, example: null },
                  is_public: { type: 'number', example: 1 },
                  created_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                  updated_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                  first_name: { type: 'string', example: 'John' },
                  last_name: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  user_image: { type: 'string', nullable: true, example: 'http://localhost/uploads/users/image.jpg' },
                  attachment_url: { type: 'string', nullable: true, example: 'http://localhost/uploads/posts/image.jpg' },
                  file_name: { type: 'string', nullable: true },
                  file_extension: { type: 'string', nullable: true },
                  file_size: { type: 'number', nullable: true },
                  is_liked: { type: 'number', example: 0 },
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
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-posts/get-feed - Get professional feed
   */
  getFeed: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get professional feed',
        description: 'Retrieve posts from followed users and own posts.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetFeedDto }),
      ApiResponse({
        status: 200,
        description: 'Feed retrieved successfully',
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
   * POST /api/public/prof-posts/get-post - Get a specific post
   */
  getPost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get a specific post',
        description: 'Retrieve a single post with all details. Increments view count.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetPostDto }),
      ApiResponse({
        status: 200,
        description: 'Post retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            post: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-posts/update-post - Update a post
   */
  updatePost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update a post',
        description: 'Update post content, description, type, attachment, or visibility.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: UpdatePostDto }),
      ApiResponse({
        status: 200,
        description: 'Post updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Post updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-posts/delete-post - Delete a post (soft delete)
   */
  deletePost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete a post',
        description: 'Soft delete a post. Only the post owner can delete their post.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: DeletePostDto }),
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
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-posts/pin-post - Pin/unpin a post
   */
  pinPost: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Pin or unpin a post',
        description: 'Pin a post to the top of user posts or unpin it.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: PinPostDto }),
      ApiResponse({
        status: 200,
        description: 'Post pinned/unpinned successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Post pinned successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-posts/get-user-posts-with-details - Get user posts with comments
   */
  getUserPostsWithDetails: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user posts with comments',
        description: 'Retrieve user posts with nested comments and replies.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetUserPostsDto }),
      ApiResponse({
        status: 200,
        description: 'Posts with details retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  comments: {
                    type: 'array',
                    items: { type: 'object' },
                  },
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
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-posts/get-trending-posts - Get trending posts
   */
  getTrendingPosts: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get trending posts',
        description: 'Retrieve trending posts from the last 7 days, ordered by engagement score.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetTrendingPostsDto }),
      ApiResponse({
        status: 200,
        description: 'Trending posts retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  engagement_score: { type: 'number', example: 125.5 },
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
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};

// ============================================================================
// Public ProfComments Controller Documentation
// ============================================================================

export const ProfCommentsPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof comments controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Posts'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-comments/create-comment - Create a new comment
   */
  createComment: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a new comment',
        description: 'Create a comment on a post or reply to another comment.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: CreateCommentDto }),
      ApiResponse({
        status: 201,
        description: 'Comment created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Comment created successfully' },
            comment_id: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-comments/get-post-comments - Get comments for a post
   */
  getPostComments: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get post comments',
        description: 'Retrieve all top-level comments for a post with nested replies.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetPostCommentsDto }),
      ApiResponse({
        status: 200,
        description: 'Comments retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            current_user: { type: 'object' },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  content: { type: 'string', example: 'Great post!' },
                  parent_id: { type: 'number', nullable: true, example: null },
                  likes_count: { type: 'number', example: 5 },
                  replies_count: { type: 'number', example: 2 },
                  replies: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                  has_replies: { type: 'boolean', example: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 50 },
                pages: { type: 'number', example: 3 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-comments/update-comment - Update a comment
   */
  updateComment: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update a comment',
        description: 'Update comment content. Only the comment owner can update their comment.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: UpdateCommentDto }),
      ApiResponse({
        status: 200,
        description: 'Comment updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Comment updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-comments/delete-comment - Delete a comment (soft delete)
   */
  deleteComment: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete a comment',
        description: 'Soft delete a comment. Only the comment owner can delete their comment.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: DeleteCommentDto }),
      ApiResponse({
        status: 200,
        description: 'Comment deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Comment deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/prof-comments/get-comment-replies - Get comment replies
   */
  getCommentReplies: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get comment replies',
        description: 'Retrieve all replies to a specific comment with nested replies.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetCommentRepliesDto }),
      ApiResponse({
        status: 200,
        description: 'Replies retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            replies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  replies: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                  has_replies: { type: 'boolean', example: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 10 },
                pages: { type: 'number', example: 1 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-comments/get-user-comments - Get user's comments
   */
  getUserComments: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user comments',
        description: 'Retrieve all comments made by a specific user (or current user).',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetUserCommentsDto }),
      ApiResponse({
        status: 200,
        description: 'User comments retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  content: { type: 'string', example: 'Great post!' },
                  post_id: { type: 'number', example: 1 },
                  post_content: { type: 'string', example: 'Original post content' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 50 },
                pages: { type: 'number', example: 3 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};
