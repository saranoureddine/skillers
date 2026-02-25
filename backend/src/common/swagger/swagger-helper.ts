import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Helper to create Swagger decorators for paginated responses
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Paginated list of items',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              totalPages: { type: 'number', example: 5 },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

/**
 * Helper to create Swagger decorators for single item responses
 */
export const ApiItemResponse = <TModel extends Type<any>>(
  model: TModel,
  description = 'Item retrieved successfully',
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

/**
 * Helper to create Swagger decorators for created responses
 */
export const ApiCreatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description = 'Item created successfully',
) => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    }),
  );
};

/**
 * Helper to create Swagger decorators for error responses
 */
export const ApiErrorResponses = (...statusCodes: number[]) => {
  const decorators = statusCodes.map((code) => {
    const messages: Record<number, string> = {
      400: 'Bad Request - Validation failed',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      409: 'Conflict - Resource already exists',
      500: 'Internal Server Error',
    };

    return ApiResponse({
      status: code,
      description: messages[code] || `HTTP ${code}`,
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'number', example: code },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          method: { type: 'string' },
        },
      },
    });
  });

  return applyDecorators(...decorators);
};

/**
 * Helper to apply common Swagger decorators (tags, bearer auth, etc.)
 */
export const ApiControllerDocs = (tag: string, requireAuth = true) => {
  const decorators = [ApiTags(tag)];
  if (requireAuth) {
    decorators.push(ApiBearerAuth('JWT-auth'));
  }
  return applyDecorators(...decorators);
};
