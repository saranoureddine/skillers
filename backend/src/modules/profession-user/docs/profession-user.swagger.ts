import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfessionUserEntity } from '../entities/profession-user.entity';
import { GetUserProfessionsDto } from '../dto/get-user-professions.dto';
import { AddUserProfessionDto } from '../dto/add-user-profession.dto';
import { UpdateUserProfessionDto } from '../dto/update-user-profession.dto';
import { UpdateUserProfessionAdminDto } from '../dto/update-user-profession-admin.dto';
import { RemoveUserProfessionDto } from '../dto/remove-user-profession.dto';
import { DeleteUserProfessionAdminDto } from '../dto/delete-user-profession-admin.dto';
import { SetPrimaryProfessionDto } from '../dto/set-primary-profession.dto';
import { GetUsersByProfessionDto } from '../dto/get-users-by-profession.dto';
import { GetUserProfessionSummaryDto } from '../dto/get-user-profession-summary.dto';
import { GetAllProfessionUsersDto } from '../dto/get-all-profession-users.dto';
import { GetRecommendedProfessionsDto } from '../dto/get-recommended-professions.dto';
import { GetNearbyProfessionalsDto } from '../dto/get-nearby-professionals.dto';
import { GetUserProfileDto } from '../dto/get-user-profile.dto';
import { GetAllUsersWithProfessionsDto } from '../dto/get-all-users-with-professions.dto';
import { GetAllProfessionalsDto } from '../dto/get-all-professionals.dto';
import { GetTopSpecialistsDto } from '../dto/get-top-specialists.dto';
import { VerifyUserProfessionDto } from '../dto/verify-user-profession.dto';
import { BulkVerifyProfessionsDto } from '../dto/bulk-verify-professions.dto';
import { TopSpecialistDto } from '../dto/top-specialist.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Profession User Controller Documentation
// ============================================================================

export const ProfessionUserControllerDocs = {
  /**
   * Controller-level decorators for shared profession user controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Profession User'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/profession-user/:id - Get profession user by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession user by ID',
        description: 'Retrieve a single profession user record by its ID. Accessible by authenticated users.',
      }),
      ApiItemResponse(ProfessionUserEntity, 'Profession user retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Profession User Controller Documentation
// ============================================================================

export const ProfessionUserPublicControllerDocs = {
  /**
   * Controller-level decorators for public profession user controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Profession User'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/profession-user/get-user-professions - Get user's professions
   */
  getUserProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user\'s professions',
        description: 'Retrieve all professions for a user. Supports viewing other users\' professions.',
      }),
      ApiBody({ type: GetUserProfessionsDto }),
      ApiResponse({
        status: 200,
        description: 'User professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            professions: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/add-user-profession - Add professions to user
   */
  addUserProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add professions to user',
        description: 'Add one or more professions to a user. Supports profile updates (location, languages, bio, CV, cover video). Maximum 5 professions per user.',
      }),
      ApiBody({ type: AddUserProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Professions added successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Professions added successfully' },
            added_professions: { type: 'array', items: { type: 'object' } },
            total_added: { type: 'number', example: 2 },
            user_updated: { type: 'boolean', example: true },
            updated_fields: { type: 'array', items: { type: 'string' } },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/profession-user/update-user-profession - Update user profession
   */
  updateUserProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update user profession',
        description: 'Update a user\'s profession (is_primary, experience_years).',
      }),
      ApiBody({ type: UpdateUserProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Profession updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profession updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/profession-user/update-user-profession-admin - Update user profession (Admin)
   */
  updateUserProfessionAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update user profession (Admin)',
        description: 'Update or add professions for any user. Supports bulk operations and admin functionality via user_id parameter.',
      }),
      ApiBody({ type: UpdateUserProfessionAdminDto }),
      ApiResponse({
        status: 200,
        description: 'Professions processed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Professions processed successfully' },
            updated_professions: { type: 'array', items: { type: 'object' } },
            added_professions: { type: 'array', items: { type: 'object' } },
            total_updated: { type: 'number', example: 1 },
            total_added: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/profession-user/remove-user-profession - Remove profession from user
   */
  removeUserProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Remove profession from user',
        description: 'Remove a profession from the authenticated user.',
      }),
      ApiBody({ type: RemoveUserProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Profession removed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profession removed successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/profession-user/delete-user-profession-admin - Delete user professions (Admin)
   */
  deleteUserProfessionAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete user professions (Admin)',
        description: 'Delete one or more professions for any user. Supports bulk operations and admin functionality via user_id parameter.',
      }),
      ApiBody({ type: DeleteUserProfessionAdminDto }),
      ApiResponse({
        status: 200,
        description: 'Professions deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Professions deleted successfully' },
            deleted_profession_user_ids: { type: 'array', items: { type: 'number' } },
            total_deleted: { type: 'number', example: 2 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/profession-user/set-primary-profession - Set primary profession
   */
  setPrimaryProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Set primary profession',
        description: 'Set a profession as the user\'s primary profession. Automatically unsets other primary professions.',
      }),
      ApiBody({ type: SetPrimaryProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Primary profession set successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Primary profession set successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/profession-user/get-users-by-profession - Get users by profession
   */
  getUsersByProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get users by profession',
        description: 'Retrieve paginated list of users who have a specific profession.',
      }),
      ApiBody({ type: GetUsersByProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-user-profession-summary - Get user profession summary
   */
  getUserProfessionSummary: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user profession summary',
        description: 'Get comprehensive summary of user\'s professions with statistics. Platform-aware (mobile/web).',
      }),
      ApiBody({ type: GetUserProfessionSummaryDto }),
      ApiResponse({
        status: 200,
        description: 'User profession summary retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            summary: { type: 'object' },
            professions: { type: 'array', items: { type: 'object' } },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-all-profession-users - Get all profession users
   */
  getAllProfessionUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all profession users',
        description: 'Get all users with professions with admin filters. Platform-aware (mobile/web).',
      }),
      ApiBody({ type: GetAllProfessionUsersDto }),
      ApiResponse({
        status: 200,
        description: 'Profession users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
            filters_applied: { type: 'object' },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-recommended-professions - Get recommended professions
   */
  getRecommendedProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get recommended professions',
        description: 'Get personalized profession recommendations based on user\'s current professions.',
      }),
      ApiBody({ type: GetRecommendedProfessionsDto }),
      ApiResponse({
        status: 200,
        description: 'Recommended professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            recommendations: { type: 'array', items: { type: 'object' } },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-nearby-professionals - Get nearby professionals
   */
  getNearbyProfessionals: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get nearby professionals',
        description: 'Find professionals by coordinates or city with advanced filtering. Supports distance-based and city-based search.',
      }),
      ApiBody({ type: GetNearbyProfessionalsDto }),
      ApiResponse({
        status: 200,
        description: 'Nearby professionals retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            professionals: { type: 'array', items: { type: 'object' } },
            pagination: { type: 'object' },
            search_criteria: { type: 'object' },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-user-profile - Get comprehensive user profile
   */
  getUserProfile: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get comprehensive user profile',
        description: 'Get complete user profile with professions, cities, working hours, posts, followers, following, and relationship status.',
      }),
      ApiBody({ type: GetUserProfileDto }),
      ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            profile: { type: 'object' },
            posts: { type: 'object' },
            quotes: { type: 'array', items: { type: 'object' } },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/profession-user/get-all-users-with-professions - Get all users with professions
   */
  getAllUsersWithProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all users with professions',
        description: 'Get all users who have at least one profession. Returns name, profile image, coordinates, and professions.',
      }),
      ApiBody({ type: GetAllUsersWithProfessionsDto }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 100 },
            filter: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-all-professionals - Get all professionals
   */
  getAllProfessionals: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all professionals',
        description: 'Get paginated list of all professionals with search and filter support.',
      }),
      ApiBody({ type: GetAllProfessionalsDto }),
      ApiResponse({
        status: 200,
        description: 'Professionals retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 100 },
            pagination: { type: 'object' },
            filter: { type: 'object' },
            search: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/profession-user/get-top-specialists - Get top specialists
   */
  getTopSpecialists: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get top specialists',
        description: 'Get all users marked as top specialists (is_top = 1) with pagination and filters.',
      }),
      ApiBody({ type: GetTopSpecialistsDto }),
      ApiResponse({
        status: 200,
        description: 'Top specialists retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 50 },
            pagination: { type: 'object' },
            search: { type: 'object' },
            filter: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),
};

// ============================================================================
// Admin Profession User Controller Documentation
// ============================================================================

export const ProfessionUserAdminControllerDocs = {
  /**
   * Controller-level decorators for admin profession user controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Profession User'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/profession-user/get-all - Get all profession users (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all profession users',
        description: 'Retrieve all profession user records. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Profession users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfessionUserEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/profession-user/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession user statistics',
        description: 'Get statistics about profession users. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 1000 },
            verified: { type: 'number', example: 700 },
            unverified: { type: 'number', example: 300 },
            primary: { type: 'number', example: 500 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * POST /api/admin/profession-user/verify-user-profession - Verify user profession
   */
  verifyUserProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Verify user profession',
        description: 'Verify or unverify a user\'s profession. Admin only.',
      }),
      ApiBody({ type: VerifyUserProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Verification status updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profession verified successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/admin/profession-user/bulk-verify-professions - Bulk verify professions
   */
  bulkVerifyProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Bulk verify professions',
        description: 'Verify or unverify multiple professions at once. Admin only.',
      }),
      ApiBody({ type: BulkVerifyProfessionsDto }),
      ApiResponse({
        status: 200,
        description: 'Bulk verification completed',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Bulk verification completed' },
            results: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 500),
    ),

  /**
   * POST /api/admin/profession-user/add-top-specialist - Add top specialist flag
   */
  addTopSpecialist: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add top specialist flag',
        description: 'Mark a user as a top specialist (is_top = 1). Admin only.',
      }),
      ApiBody({ type: TopSpecialistDto }),
      ApiResponse({
        status: 200,
        description: 'User marked as top specialist successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User marked as top specialist successfully' },
            user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/admin/profession-user/remove-top-specialist - Remove top specialist flag
   */
  removeTopSpecialist: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Remove top specialist flag',
        description: 'Remove top specialist flag from a user (is_top = 0). Admin only.',
      }),
      ApiBody({ type: TopSpecialistDto }),
      ApiResponse({
        status: 200,
        description: 'User removed from top specialists successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User removed from top specialists successfully' },
            user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),
};
