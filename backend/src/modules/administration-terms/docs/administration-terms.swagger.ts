import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateAdministrationTermDto,
  UpdateAdministrationTermDto,
  GetAdministrationTermDto,
  GetAllAdministrationTermsDto,
  DeleteAdministrationTermDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public Administration Terms Controller Documentation
// ============================================================================

export const AdministrationTermsPublicControllerDocs = {
  /**
   * Controller-level decorators for public administration terms controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Administration Terms'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/administration-terms/create-administration-term - Create administration term
   */
  createAdministrationTerm: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create administration term',
        description:
          'Create a new administration term. Required fields: city_id, from_year, to_year, is_active. Prevents duplicate terms for the same city and time period.',
      }),
      ApiBody({ type: CreateAdministrationTermDto }),
      ApiResponse({
        status: 201,
        description: 'Administration term created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            term: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                city_id: { type: 'number', example: 1 },
                from_year: { type: 'number', example: 2020 },
                to_year: { type: 'number', example: 2024 },
                is_active: { type: 'number', example: 1 },
                title_en: { type: 'string', nullable: true, example: 'Administration Term 2020-2024' },
                title_ar: { type: 'string', nullable: true, example: 'فترة الإدارة 2020-2024' },
                description_en: { type: 'string', nullable: true },
                description_ar: { type: 'string', nullable: true },
                created_by: { type: 'string', example: '507f1f77bcf86cd799439011' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 409, 422, 500),
    ),

  /**
   * POST /api/public/administration-terms/update-administration-term - Update administration term
   */
  updateAdministrationTerm: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update administration term',
        description:
          'Update an existing administration term. All fields are optional. Auto-swaps years if from_year > to_year.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Administration term ID' }),
      ApiBody({ type: UpdateAdministrationTermDto }),
      ApiResponse({
        status: 200,
        description: 'Administration term updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            term: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                city_id: { type: 'number' },
                from_year: { type: 'number' },
                to_year: { type: 'number' },
                is_active: { type: 'number' },
                title_en: { type: 'string', nullable: true },
                title_ar: { type: 'string', nullable: true },
                description_en: { type: 'string', nullable: true },
                description_ar: { type: 'string', nullable: true },
                created_by: { type: 'string' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 422, 500),
    ),

  /**
   * GET /api/public/administration-terms/get-administration-term - Get administration term
   */
  getAdministrationTerm: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get administration term',
        description: 'Get a single administration term by ID.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Administration term ID' }),
      ApiResponse({
        status: 200,
        description: 'Administration term retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            term: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                city_id: { type: 'number' },
                from_year: { type: 'number' },
                to_year: { type: 'number' },
                is_active: { type: 'number' },
                title_en: { type: 'string', nullable: true },
                title_ar: { type: 'string', nullable: true },
                description_en: { type: 'string', nullable: true },
                description_ar: { type: 'string', nullable: true },
                created_by: { type: 'string' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * GET /api/public/administration-terms/get-all-administration-terms - Get all administration terms
   */
  getAllAdministrationTerms: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all administration terms',
        description:
          'Get all administration terms with pagination. Ordered by from_year and to_year descending.',
      }),
      ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
      ApiQuery({ name: 'perPage', type: Number, required: false, example: 20 }),
      ApiResponse({
        status: 200,
        description: 'Administration terms retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            terms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  city_id: { type: 'number' },
                  from_year: { type: 'number' },
                  to_year: { type: 'number' },
                  is_active: { type: 'number' },
                  title_en: { type: 'string', nullable: true },
                  title_ar: { type: 'string', nullable: true },
                  description_en: { type: 'string', nullable: true },
                  description_ar: { type: 'string', nullable: true },
                  created_by: { type: 'string' },
                  updated_by: { type: 'string', nullable: true },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total_count: { type: 'number', example: 100 },
                page_count: { type: 'number', example: 5 },
                current_page: { type: 'number', example: 1 },
                per_page: { type: 'number', example: 20 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * DELETE /api/public/administration-terms/delete-administration-term - Delete administration term
   */
  deleteAdministrationTerm: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete administration term',
        description:
          'Delete an administration term. Also deletes all related CitiesMembers records for the same city and term years.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Administration term ID' }),
      ApiResponse({
        status: 200,
        description: 'Administration term deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Term and members deleted' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),
};
