import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateSuggestionDto,
  UpdateSuggestionDto,
  GetSuggestionsDto,
  ReplySuggestionDto,
  UpdateReplyDto,
  RateSuggestionDto,
  UpdateRatingDto,
  GetSuggestionRatingsDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public SuggestionsClaims Controller Documentation
// ============================================================================

export const SuggestionsClaimsPublicControllerDocs = {
  /**
   * Controller-level decorators for public suggestions-claims controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Suggestions Claims'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/suggestions-claims/add-suggestion - Add a new suggestion/claim
   */
  addSuggestion: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add a new suggestion or claim',
        description: 'Create a new suggestion or claim. Guest users are restricted.',
      }),
      ApiBody({ type: CreateSuggestionDto }),
      ApiResponse({
        status: 200,
        description: 'Suggestion/claim added successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'added_successfully' },
            suggestion: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                categoryId: { type: 'number', example: 1 },
                cityId: { type: 'number', example: 1 },
                details: { type: 'string', example: 'This is a suggestion...' },
                type: { type: 'string', enum: ['suggestion', 'claim'], example: 'suggestion' },
                status: { type: 'string', example: 'pending' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
            table_name: { type: 'number', example: 235 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * GET /api/public/suggestions-claims/get-suggestion-by-id/:id - Get suggestion by ID
   */
  getSuggestionById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get suggestion/claim by ID',
        description: 'Get a single suggestion/claim by its ID. Can be accessed with or without authentication.',
      }),
      ApiParam({
        name: 'id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Suggestion/claim retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            suggestion: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                details: { type: 'string', example: 'This is a suggestion...' },
                category_id: { type: 'number', example: 1 },
                category_name: { type: 'string', example: 'Infrastructure' },
                city_id: { type: 'number', example: 1 },
                city_name: { type: 'string', example: 'Beirut' },
                reply: { type: 'string', nullable: true },
                type: { type: 'string', enum: ['suggestion', 'claim'], example: 'suggestion' },
                is_replied: { type: 'number', example: 0 },
                status: { type: 'string', example: 'pending' },
                createdBy: { type: 'object', nullable: true },
                rating: {
                  type: 'object',
                  properties: {
                    average: { type: 'number', example: 4.5 },
                    total: { type: 'number', example: 10 },
                    formatted: { type: 'string', example: '4.5 ★ (10 ratings)' },
                  },
                },
                user_rating: { type: 'number', nullable: true, example: 5 },
                images: {
                  type: 'array',
                  items: { type: 'object', properties: { file_path: { type: 'string' } } },
                },
              },
            },
            table_name: { type: 'number', example: 235 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/suggestions-claims/get-suggestions - Get list of suggestions/claims
   */
  getSuggestions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get list of suggestions/claims',
        description: 'Get paginated list of suggestions/claims with filters.',
      }),
      ApiBody({ type: GetSuggestionsDto }),
      ApiResponse({
        status: 200,
        description: 'Suggestions/claims retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  details: { type: 'string', example: 'This is a suggestion...' },
                  category_name: { type: 'string', example: 'Infrastructure' },
                  city_name: { type: 'string', example: 'Beirut' },
                  type: { type: 'string', enum: ['suggestion', 'claim'], example: 'suggestion' },
                  status: { type: 'string', example: 'pending' },
                  rating: { type: 'object' },
                  user_rating: { type: 'number', nullable: true },
                  images: { type: 'array' },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/suggestions-claims/rate-suggestion - Rate a suggestion/claim
   */
  rateSuggestion: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Rate a suggestion/claim',
        description: 'Add or update a rating (1-5) for a suggestion/claim.',
      }),
      ApiBody({ type: RateSuggestionDto }),
      ApiResponse({
        status: 200,
        description: 'Rating added/updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating added successfully' },
            rating: { type: 'number', example: 5 },
            suggestion_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * GET /api/public/suggestions-claims/get-user-rating/:suggestion_id - Get user's rating
   */
  getUserRating: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get user's rating for a suggestion/claim",
        description: "Get the authenticated user's rating for a specific suggestion/claim.",
      }),
      ApiParam({
        name: 'suggestion_id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'User rating retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            has_rating: { type: 'boolean', example: true },
            rating: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                rating: { type: 'number', example: 5 },
                created_at: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updated_at: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
            message: { type: 'string', nullable: true },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/suggestions-claims/get-suggestion-ratings/:suggestion_id - Get all ratings
   */
  getSuggestionRatings: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all ratings for a suggestion/claim',
        description: 'Get paginated list of all ratings for a specific suggestion/claim.',
      }),
      ApiParam({
        name: 'suggestion_id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiBody({ type: GetSuggestionRatingsDto }),
      ApiResponse({
        status: 200,
        description: 'Ratings retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            ratings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  rating: { type: 'number', example: 5 },
                  user_name: { type: 'string', example: 'John Doe' },
                  star_display: { type: 'string', example: '★★★★★' },
                  created_at: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 50 },
                total_pages: { type: 'number', example: 5 },
              },
            },
            suggestion: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                average_rating: { type: 'number', example: 4.5 },
                total_ratings: { type: 'number', example: 50 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),
};

// ============================================================================
// Admin SuggestionsClaims Controller Documentation
// ============================================================================

export const SuggestionsClaimsAdminControllerDocs = {
  /**
   * Controller-level decorators for admin suggestions-claims controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Suggestions Claims (Admin)'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/admin/suggestions-claims/reply - Reply to a suggestion/claim
   */
  reply: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Reply to a suggestion/claim',
        description: 'Add a reply to a suggestion/claim and notify the creator.',
      }),
      ApiBody({ type: ReplySuggestionDto }),
      ApiResponse({
        status: 200,
        description: 'Reply added successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            suggestion: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * PATCH /api/admin/suggestions-claims/update-reply/:id - Update reply
   */
  updateReply: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update reply to a suggestion/claim',
        description: 'Update an existing reply and notify the creator.',
      }),
      ApiParam({
        name: 'id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiBody({ type: UpdateReplyDto }),
      ApiResponse({
        status: 200,
        description: 'Reply updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'reply_updated_successfully' },
            suggestion: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * PATCH /api/admin/suggestions-claims/update-suggestion/:id - Update suggestion/claim
   */
  updateSuggestion: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update a suggestion/claim',
        description: 'Update suggestion/claim fields (category, city, details, type, status).',
      }),
      ApiParam({
        name: 'id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiBody({ type: UpdateSuggestionDto }),
      ApiResponse({
        status: 200,
        description: 'Suggestion/claim updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'updated_successfully' },
            suggestion: { type: 'object' },
            table_name: { type: 'number', example: 235 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * DELETE /api/admin/suggestions-claims/delete-suggestion/:id - Delete suggestion/claim
   */
  deleteSuggestion: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete a suggestion/claim',
        description: 'Delete a suggestion/claim. Users can only delete their own entries.',
      }),
      ApiParam({
        name: 'id',
        description: 'Suggestion/Claim ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Suggestion/claim deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'deleted_successfully' },
            table_name: { type: 'number', example: 235 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 404, 500),
    ),

  /**
   * PATCH /api/admin/suggestions-claims/update-rating/:id - Update rating
   */
  updateRating: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update a rating',
        description: 'Update an existing rating for a suggestion/claim.',
      }),
      ApiParam({
        name: 'id',
        description: 'Rating ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiBody({ type: UpdateRatingDto }),
      ApiResponse({
        status: 200,
        description: 'Rating updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating updated successfully' },
            rating: { type: 'number', example: 5 },
            suggestion_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * DELETE /api/admin/suggestions-claims/delete-rating/:id - Delete rating
   */
  deleteRating: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete a rating',
        description: 'Delete an existing rating for a suggestion/claim.',
      }),
      ApiParam({
        name: 'id',
        description: 'Rating ID',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Rating deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Rating deleted successfully' },
            suggestion_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),
};

// ============================================================================
// Shared SuggestionsClaims Controller Documentation
// ============================================================================

export const SuggestionsClaimsControllerDocs = {
  /**
   * Controller-level decorators for shared suggestions-claims controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Suggestions Claims'),
      ApiBearerAuth('Token-auth'),
    ),
};
