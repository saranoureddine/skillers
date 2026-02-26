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
  GlobalSearchDto,
  SearchProfessionsDto,
  SearchUsersByProfessionDto,
  GetProfessionTrendsDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public ProfSearch Controller Documentation
// ============================================================================

export const ProfSearchPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof search controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Search'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-search/global-search - Global search across all types
   */
  globalSearch: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Global search',
        description:
          'Search across posts, groups, professions, categories, and users with advanced filtering and location-based sorting.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GlobalSearchDto }),
      ApiResponse({
        status: 200,
        description: 'Search results retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            query: { type: 'string', example: 'doctor' },
            type: { type: 'string', example: 'all' },
            results: {
              type: 'object',
              properties: {
                posts: { type: 'array', items: {} },
                groups: { type: 'array', items: {} },
                professions: { type: 'array', items: {} },
                categories: { type: 'array', items: {} },
                users: { type: 'array', items: {} },
              },
            },
            total_count: { type: 'number', example: 150 },
            filters: {
              type: 'object',
              properties: {
                cities: { type: 'array', items: { type: 'number' } },
                categories: { type: 'array', items: { type: 'number' } },
                subcategories: { type: 'array', items: { type: 'number' } },
              },
            },
            location_sorting: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean', example: true },
                latitude: { type: 'number', example: 33.8938 },
                longitude: { type: 'number', example: 35.5018 },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 150 },
                pages: { type: 'number', example: 8 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/prof-search/search-professions - Search professions
   */
  searchProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Search professions',
        description:
          'Search for professions with filtering by category, user count, and sorting options.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: SearchProfessionsDto }),
      ApiResponse({
        status: 200,
        description: 'Professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            professions: { type: 'array', items: {} },
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

  /**
   * POST /api/public/prof-search/search-users-by-profession - Search users by profession
   */
  searchUsersByProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Search users by profession',
        description:
          'Search for users filtered by profession, category, verification status, experience, and other criteria.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: SearchUsersByProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: {} },
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
   * POST /api/public/prof-search/get-profession-stats - Get profession statistics
   */
  getProfessionStats: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession statistics',
        description:
          'Retrieve statistics about professions, categories, users, and verification rates.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            stats: {
              type: 'object',
              properties: {
                total_professions: { type: 'number', example: 200 },
                total_categories: { type: 'number', example: 10 },
                total_profession_users: { type: 'number', example: 5000 },
                verified_profession_users: { type: 'number', example: 2500 },
                verification_rate: { type: 'number', example: 50.0 },
              },
            },
            popular_professions: { type: 'array', items: {} },
            categories_with_counts: { type: 'array', items: {} },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-search/get-profession-suggestions - Get profession suggestions
   */
  getProfessionSuggestions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession suggestions',
        description:
          'Get personalized profession suggestions based on user profile and popular professions.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiResponse({
        status: 200,
        description: 'Suggestions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            suggestions: { type: 'array', items: {} },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-search/get-profession-trends - Get profession trends
   */
  getProfessionTrends: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession trends',
        description:
          'Get trending professions based on recent additions in a specified time period.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetProfessionTrendsDto }),
      ApiResponse({
        status: 200,
        description: 'Trends retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            trending_professions: { type: 'array', items: {} },
            period_days: { type: 'number', example: 30 },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};
