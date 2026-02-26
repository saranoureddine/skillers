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
import { ProfessionalAvailabilityEntity } from '../entities/professional-availability.entity';
import { CreateProfessionalAvailabilityDto } from '../dto/create-professional-availability.dto';
import { UpdateProfessionalAvailabilityDto } from '../dto/update-professional-availability.dto';
import {
  ApiPaginatedResponse,
  ApiItemResponse,
  ApiCreatedResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Professional Availability Controller Documentation
// ============================================================================

export const ProfessionalAvailabilityControllerDocs = {
  /**
   * Controller-level decorators for shared professional availability controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professional Availability'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/professional-availability - List all availability (paginated)
   */
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all availability',
        description: 'Retrieve a paginated list of all professional availability. Accessible by authenticated users.',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 20, max: 100)',
        example: 20,
      }),
      ApiPaginatedResponse(ProfessionalAvailabilityEntity),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/professional-availability/:id - Get availability by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get availability by ID',
        description: 'Retrieve a single availability slot by its ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Availability ID',
        example: 1,
      }),
      ApiItemResponse(ProfessionalAvailabilityEntity, 'Availability retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Professional Availability Controller Documentation
// ============================================================================

export const ProfessionalAvailabilityPublicControllerDocs = {
  /**
   * Controller-level decorators for public professional availability controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professional Availability'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/professional-availability/check-professional-status - Check professional status
   */
  checkProfessionalStatus: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Check professional status',
        description: 'Check if the authenticated user is a professional user and get their profession details.',
      }),
      ApiResponse({
        status: 200,
        description: 'Professional status retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                isProfessional: { type: 'boolean', example: true },
                professions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      profession_id: { type: 'number', example: 1 },
                      is_primary: { type: 'number', example: 1 },
                      experience_years: { type: 'number', example: 5 },
                      is_verified: { type: 'number', example: 1 },
                    },
                  },
                },
                canManageAvailability: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/professional-availability/set-availability - Set availability
   */
  setAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Set availability',
        description: 'Set availability slots for a professional user. Replaces all existing availability. Professional users only.',
      }),
      ApiBody({ type: CreateProfessionalAvailabilityDto }),
      ApiResponse({
        status: 200,
        description: 'Availability set successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Availability set successfully' },
            data: {
              type: 'object',
              properties: {
                slotsCount: { type: 'number', example: 5 },
                userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                slots: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      dayOfWeek: { type: 'string', example: 'monday' },
                      startTime: { type: 'string', example: '09:00' },
                      endTime: { type: 'string', example: '17:00' },
                      slotDuration: { type: 'number', example: 60 },
                      maxAppointmentsPerSlot: { type: 'number', example: 1 },
                      isActive: { type: 'number', example: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 500),
    ),

  /**
   * GET /api/public/professional-availability/get-my-availability - Get my availability
   */
  getMyAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get my availability',
        description: 'Retrieve the authenticated professional user\'s availability slots. Professional users only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Availability retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                availabilitySlots: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                      dayOfWeek: { type: 'string', example: 'monday' },
                      startTime: { type: 'string', example: '09:00:00' },
                      endTime: { type: 'string', example: '17:00:00' },
                      slotDuration: { type: 'number', example: 60 },
                      maxAppointmentsPerSlot: { type: 'number', example: 1 },
                      isActive: { type: 'number', example: 1 },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
                totalSlots: { type: 'number', example: 5 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),

  /**
   * GET /api/public/professional-availability/get-availability - Get availability
   */
  getAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get availability',
        description: 'Retrieve availability slots for a user. If user_id is not provided, returns current user\'s availability.',
      }),
      ApiQuery({
        name: 'user_id',
        required: false,
        type: String,
        description: 'Target user ID (optional, defaults to current user)',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Availability retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                isProfessional: { type: 'boolean', example: true },
                availabilitySlots: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                      dayOfWeek: { type: 'string', example: 'monday' },
                      startTime: { type: 'string', example: '09:00:00' },
                      endTime: { type: 'string', example: '17:00:00' },
                      slotDuration: { type: 'number', example: 60 },
                      maxAppointmentsPerSlot: { type: 'number', example: 1 },
                      isActive: { type: 'number', example: 1 },
                    },
                  },
                },
                totalSlots: { type: 'number', example: 5 },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * PATCH /api/public/professional-availability/update-availability - Update availability
   */
  updateAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update availability',
        description: 'Update an existing availability slot. Professional users only.',
      }),
      ApiBody({ type: UpdateProfessionalAvailabilityDto }),
      ApiResponse({
        status: 200,
        description: 'Availability updated successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Availability updated successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * DELETE /api/public/professional-availability/delete-availability - Delete availability
   */
  deleteAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete availability',
        description: 'Delete an availability slot. Professional users only.',
      }),
      ApiQuery({
        name: 'availability_id',
        required: true,
        type: Number,
        description: 'Availability slot ID to delete',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Availability deleted successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Availability deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * POST /api/public/professional-availability/toggle-availability - Toggle availability
   */
  toggleAvailability: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Toggle availability',
        description: 'Enable or disable an availability slot. Professional users only.',
      }),
      ApiBody({
        schema: {
          properties: {
            availability_id: { type: 'number', example: 1 },
            is_active: { type: 'number', example: 1, description: '1 for active, 0 for inactive' },
          },
          required: ['availability_id', 'is_active'],
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Availability toggled successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Availability enabled successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),
};

// ============================================================================
// Admin Professional Availability Controller Documentation
// ============================================================================

export const ProfessionalAvailabilityAdminControllerDocs = {
  /**
   * Controller-level decorators for admin professional availability controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Professional Availability'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/professional-availability/get-all - Get all availability (admin)
   */
  getAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all availability',
        description: 'Retrieve paginated list of all professional availability. Admin only.',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 20)',
        example: 20,
      }),
      ApiPaginatedResponse(ProfessionalAvailabilityEntity),
      ApiErrorResponses(400, 401, 403, 500),
    ),

  /**
   * GET /api/admin/professional-availability/get-by-user/:userId - Get availability by user ID (admin)
   */
  getByUserId: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get availability by user ID',
        description: 'Retrieve all availability slots for a specific user. Admin only.',
      }),
      ApiParam({
        name: 'userId',
        type: String,
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Availability retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProfessionalAvailabilityEntity' },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * DELETE /api/admin/professional-availability/:id - Delete availability (admin)
   */
  delete: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete availability',
        description: 'Delete an availability slot. Admin can delete any availability. Admin only.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Availability ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Availability deleted successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Availability deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),

  /**
   * GET /api/admin/professional-availability/statistics - Get statistics (admin)
   */
  getStatistics: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get availability statistics',
        description: 'Get statistics about professional availability. Admin only.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
          properties: {
            total: { type: 'number', example: 1000 },
            active: { type: 'number', example: 850 },
            inactive: { type: 'number', example: 150 },
          },
        },
      }),
      ApiErrorResponses(401, 403, 500),
    ),
};
