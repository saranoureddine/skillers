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
  CreatePermissionDto,
  UpdatePermissionDto,
  GetPermissionDto,
  GetAllPermissionsDto,
  DeletePermissionDto,
} from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public Ag Permissions Controller Documentation
// ============================================================================

export const AgPermissionsPublicControllerDocs = {
  /**
   * Controller-level decorators for public ag permissions controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Ag Permissions'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/ag-permissions/create-permission - Create or update permission
   */
  createPermission: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create or update permission',
        description:
          'Create a new permission or update existing one if found by group_id and table_id. Maps table names (delivery_categories → delivery_cat, dashboard_users → ag_users).',
      }),
      ApiBody({ type: CreatePermissionDto }),
      ApiResponse({
        status: 201,
        description: 'Permission created or updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            permission: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                table_id: { type: 'number', example: 1 },
                user_id: { type: 'string', nullable: true },
                group_id: { type: 'number', nullable: true, example: 1 },
                create: { type: 'number', example: 1, enum: [0, 1] },
                view: { type: 'number', example: 1, enum: [0, 1] },
                update: { type: 'number', example: 1, enum: [0, 1] },
                delete: { type: 'number', example: 0, enum: [0, 1] },
                condition: { type: 'string', nullable: true },
                created_by: { type: 'string' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                center_num: { type: 'number', example: 0 },
              },
            },
            message: {
              type: 'string',
              example: 'Permission created',
              enum: ['Permission created', 'Permission updated'],
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 422, 500),
    ),

  /**
   * GET /api/public/ag-permissions/get-permission - Get single permission
   */
  getPermission: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get permission',
        description: 'Get a single permission by ID.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Permission ID' }),
      ApiResponse({
        status: 200,
        description: 'Permission retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            permission: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                table_id: { type: 'number' },
                user_id: { type: 'string', nullable: true },
                group_id: { type: 'number', nullable: true },
                create: { type: 'number', enum: [0, 1] },
                view: { type: 'number', enum: [0, 1] },
                update: { type: 'number', enum: [0, 1] },
                delete: { type: 'number', enum: [0, 1] },
                condition: { type: 'string', nullable: true },
                created_by: { type: 'string' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                center_num: { type: 'number', nullable: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * POST /api/public/ag-permissions/update-permission - Update permission
   */
  updatePermission: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update permission',
        description: 'Update an existing permission by ID.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Permission ID' }),
      ApiBody({ type: UpdatePermissionDto }),
      ApiResponse({
        status: 200,
        description: 'Permission updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            permission: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                table_id: { type: 'number' },
                user_id: { type: 'string', nullable: true },
                group_id: { type: 'number', nullable: true },
                create: { type: 'number', enum: [0, 1] },
                view: { type: 'number', enum: [0, 1] },
                update: { type: 'number', enum: [0, 1] },
                delete: { type: 'number', enum: [0, 1] },
                condition: { type: 'string', nullable: true },
                created_by: { type: 'string' },
                updated_by: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                center_num: { type: 'number', nullable: true },
              },
            },
            message: { type: 'string', example: 'Permission updated' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 422, 500),
    ),

  /**
   * DELETE /api/public/ag-permissions/delete-permission - Delete permission
   */
  deletePermission: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete permission',
        description: 'Delete a permission by ID.',
      }),
      ApiQuery({ name: 'id', type: String, required: true, description: 'Permission ID' }),
      ApiResponse({
        status: 200,
        description: 'Permission deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Permission deleted' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * GET /api/public/ag-permissions/get-all-permissions - Get all permissions
   */
  getAllPermissions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all permissions',
        description:
          'Get all permissions with pagination. Can filter by user_id or group_id. Includes table_name from joined ag_tables_schema.',
      }),
      ApiQuery({ name: 'userId', type: String, required: false, description: 'Filter by user ID' }),
      ApiQuery({ name: 'groupId', type: Number, required: false, description: 'Filter by group ID' }),
      ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
      ApiQuery({ name: 'perPage', type: Number, required: false, example: 20 }),
      ApiResponse({
        status: 200,
        description: 'Permissions retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            permissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  table_id: { type: 'number' },
                  user_id: { type: 'string', nullable: true },
                  group_id: { type: 'number', nullable: true },
                  create: { type: 'number', enum: [0, 1] },
                  view: { type: 'number', enum: [0, 1] },
                  update: { type: 'number', enum: [0, 1] },
                  delete: { type: 'number', enum: [0, 1] },
                  condition: { type: 'string', nullable: true },
                  created_by: { type: 'string' },
                  updated_by: { type: 'string', nullable: true },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                  center_num: { type: 'number', nullable: true },
                  table_name: { type: 'string', example: 'users' },
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
};
