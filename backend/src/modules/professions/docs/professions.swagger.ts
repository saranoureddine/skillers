import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';
import { GetProfessionsDto } from '../dto/get-professions.dto';
import { GetProfessionDto } from '../dto/get-profession.dto';
import { CreateProfessionDto } from '../dto/create-profession.dto';
import { UpdateProfessionDto } from '../dto/update-profession.dto';
import { DeleteProfessionDto } from '../dto/delete-profession.dto';
import { GetProfessionsByCategoryDto } from '../dto/get-professions-by-category.dto';
import { SaveOrderDto } from '../dto/save-order.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Professions Controller Documentation
// ============================================================================

export const ProfessionsControllerDocs = {
  /**
   * Controller-level decorators for shared professions controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professions'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/professions/:id - Get profession by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession by ID',
        description: 'Retrieve a single profession by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Profession ID',
        example: 1,
      }),
      ApiItemResponse(ProfCategoryEntity, 'Profession retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Professions Controller Documentation
// ============================================================================

export const ProfessionsPublicControllerDocs = {
  /**
   * Controller-level decorators for public professions controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professions'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/professions/get-professions - Get all professions
   */
  getProfessions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all professions',
        description: 'Retrieve all active professions with optional filtering. Platform-aware (mobile shows only active, web shows all).',
      }),
      ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Category ID to filter by' }),
      ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' }),
      ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 }),
      ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 20 }),
      ApiResponse({
        status: 200,
        description: 'Professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                professions: { type: 'array', items: { type: 'object' } },
                total_count: { type: 'number' },
                returned_count: { type: 'number' },
                filters_applied: { type: 'object' },
              },
            },
            pagination: { type: 'object' },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/professions/get-profession - Get profession by ID
   */
  getProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get profession by ID',
        description: 'Retrieve a specific profession with details including users and statistics.',
      }),
      ApiBody({ type: GetProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Profession retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                profession: { type: 'object' },
                statistics: { type: 'object' },
              },
            },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/professions/create-profession - Create profession
   */
  createProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create profession',
        description: 'Create a new profession.',
      }),
      ApiBody({ type: CreateProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Profession created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profession created successfully' },
            profession_id: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/professions/update-profession - Update profession
   */
  updateProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update profession',
        description: 'Update a profession.',
      }),
      ApiBody({ type: UpdateProfessionDto }),
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
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/professions/delete-profession - Delete profession
   */
  deleteProfession: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete profession',
        description: 'Delete a profession. Cannot delete if profession has associated users.',
      }),
      ApiBody({ type: DeleteProfessionDto }),
      ApiResponse({
        status: 200,
        description: 'Profession deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Profession deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 409, 500),
    ),

  /**
   * POST /api/public/professions/get-professions-by-category - Get professions by category
   */
  getProfessionsByCategory: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get professions by category (hierarchical)',
        description: 'Retrieve all professions in a category hierarchy (includes subcategories).',
      }),
      ApiBody({ type: GetProfessionsByCategoryDto }),
      ApiResponse({
        status: 200,
        description: 'Professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                professions: { type: 'array', items: { type: 'object' } },
                hierarchy_info: { type: 'object' },
              },
            },
            metadata: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/professions/save-order - Save profession order
   */
  saveOrder: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Save profession order',
        description: 'Update the sort order of multiple professions.',
      }),
      ApiBody({ type: SaveOrderDto }),
      ApiResponse({
        status: 200,
        description: 'Order saved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Order saved successfully' },
            updated_professions: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Admin Professions Controller Documentation
// ============================================================================

export const ProfessionsAdminControllerDocs = {
  /**
   * Controller-level decorators for admin professions controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professions'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/professions/get-all - Get all professions (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all professions',
        description: 'Retrieve all professions. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Professions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfCategoryEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/admin/professions/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get professions statistics',
        description: 'Get statistics about professions. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 100 },
            active: { type: 'number', example: 80 },
            inactive: { type: 'number', example: 20 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
