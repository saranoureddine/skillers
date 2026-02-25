import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GetTablesDto } from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public Ag Tables Schema Controller Documentation
// ============================================================================

export const AgTablesSchemaPublicControllerDocs = {
  /**
   * Controller-level decorators for public ag tables schema controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Ag Tables Schema'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/ag-tables-schema/get-tables - Get tables with permissions
   */
  getTables: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get tables with permissions',
        description:
          'Get all allowed tables with their permissions for a specific user group. Returns tables with view, create, update, and delete permissions. Skips "Roles" table for Admin group.',
      }),
      ApiQuery({
        name: 'groupId',
        type: Number,
        required: true,
        description: 'User group ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Tables retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            tables: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    example: 'Users',
                  },
                  permissions: {
                    type: 'object',
                    properties: {
                      view: { type: 'number', example: 1 },
                      create: { type: 'number', example: 1 },
                      update: { type: 'number', example: 1 },
                      delete: { type: 'number', example: 0 },
                    },
                  },
                },
              },
              example: {
                users: {
                  title: 'Users',
                  permissions: {
                    view: 1,
                    create: 1,
                    update: 1,
                    delete: 0,
                  },
                },
                stores: {
                  title: 'Stores',
                  permissions: {
                    view: 1,
                    create: 0,
                    update: 0,
                    delete: 0,
                  },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};
