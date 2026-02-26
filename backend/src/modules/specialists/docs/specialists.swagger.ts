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
import { AddSpecialistDto } from '../dto/add-specialist.dto';
import { RemoveSpecialistDto } from '../dto/remove-specialist.dto';
import { GetSpecialistsDto } from '../dto/get-specialists.dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Specialists Controller Documentation
// ============================================================================

export const SpecialistsControllerDocs = {
  /**
   * Controller-level decorators for shared specialists controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Specialists'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/specialists/:id - Get specialist by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get specialist by ID',
        description: 'Retrieve a single specialist by their ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: String,
        description: 'Specialist user ID',
        example: '507f1f77bcf86cd799439011',
      }),
      ApiResponse({
        status: 200,
        description: 'Specialist retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                name: { type: 'string', example: 'John Doe' },
                profileImage: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                imageUrl: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                rating: { type: 'number', example: 4.5 },
                totalRatings: { type: 'number', example: 100 },
                experience: { type: 'number', example: 5 },
                specialty: { type: 'string', example: 'Software Engineer' },
                category: { type: 'string', example: 'IT' },
                languages: { type: 'array', items: { type: 'string' }, example: ['en', 'ar'] },
                location: { type: 'string', example: 'Beirut' },
                isOnline: { type: 'boolean', example: true },
                lastSeen: { type: 'string', format: 'date-time', nullable: true },
                phone: { type: 'string', example: '+961 1234567' },
                phoneNumber: { type: 'string', example: '1234567' },
                hourlyRate: { type: 'number', example: 50.0, nullable: true },
                followers: { type: 'number', example: 100 },
                isVerified: { type: 'boolean', example: true },
                professionId: { type: 'number', example: 1 },
                addedDate: { type: 'string', format: 'date-time', nullable: true },
                bio: { type: 'string', example: 'Experienced software developer' },
                yearsOfExperience: { type: 'number', example: 5 },
                reviewCount: { type: 'number', example: 100 },
                email: { type: 'string', example: 'john.doe@example.com', nullable: true },
                website: { type: 'string', example: 'https://example.com', nullable: true },
                address: { type: 'string', example: '123 Main St', nullable: true },
                gender: { type: 'string', example: 'male', nullable: true },
              },
            },
            message: { type: 'string', example: 'Specialist retrieved successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};

// ============================================================================
// Public Specialists Controller Documentation
// ============================================================================

export const SpecialistsPublicControllerDocs = {
  /**
   * Controller-level decorators for public specialists controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Specialists'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/specialists/add-specialist - Add user as specialist
   */
  addSpecialist: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add user as specialist',
        description: 'Add a user as a verified specialist. Creates profession_user entry and updates user flags.',
      }),
      ApiBody({ type: AddSpecialistDto }),
      ApiResponse({
        status: 200,
        description: 'User successfully added as specialist',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User successfully added as specialist' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                name: { type: 'string', example: 'John Doe' },
                profileImage: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                imageUrl: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                rating: { type: 'number', example: 4.5 },
                totalRatings: { type: 'number', example: 100 },
                experience: { type: 'number', example: 5 },
                specialty: { type: 'string', example: 'Software Engineer' },
                category: { type: 'string', example: 'IT' },
                languages: { type: 'array', items: { type: 'string' }, example: ['en', 'ar'] },
                location: { type: 'string', example: 'Beirut' },
                isOnline: { type: 'boolean', example: true },
                lastSeen: { type: 'string', format: 'date-time', nullable: true },
                phone: { type: 'string', example: '+961 1234567' },
                phoneNumber: { type: 'string', example: '1234567' },
                hourlyRate: { type: 'number', example: 50.0, nullable: true },
                followers: { type: 'number', example: 100 },
                isVerified: { type: 'boolean', example: true },
                professionId: { type: 'number', example: 1 },
                addedDate: { type: 'string', format: 'date-time', nullable: true },
                bio: { type: 'string', example: 'Experienced software developer' },
                yearsOfExperience: { type: 'number', example: 5 },
                reviewCount: { type: 'number', example: 100 },
                email: { type: 'string', example: 'john.doe@example.com', nullable: true },
                website: { type: 'string', example: 'https://example.com', nullable: true },
                address: { type: 'string', example: '123 Main St', nullable: true },
                gender: { type: 'string', example: 'male', nullable: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 409, 500),
    ),
};

// ============================================================================
// Admin Specialists Controller Documentation
// ============================================================================

export const SpecialistsAdminControllerDocs = {
  /**
   * Controller-level decorators for admin specialists controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Specialists'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/specialists/admin-specialists - Get all specialists (admin)
   */
  getAllSpecialists: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all specialists',
        description: 'Retrieve paginated list of all specialists. Admin only.',
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
        description: 'Items per page (default: 50)',
        example: 50,
      }),
      ApiQuery({
        name: 'top',
        required: false,
        type: Number,
        description: 'Show top specialists only (1) or all specialists (0)',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Specialists retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  name: { type: 'string', example: 'John Doe' },
                  profileImage: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                  imageUrl: { type: 'string', example: 'https://smartvillageprod.smartvillage.net/uploads/users/avatar.jpg' },
                  rating: { type: 'number', example: 4.5 },
                  totalRatings: { type: 'number', example: 100 },
                  experience: { type: 'number', example: 5 },
                  specialty: { type: 'string', example: 'Software Engineer' },
                  category: { type: 'string', example: 'IT' },
                  languages: { type: 'array', items: { type: 'string' }, example: ['en', 'ar'] },
                  location: { type: 'string', example: 'Beirut' },
                  isOnline: { type: 'boolean', example: true },
                  lastSeen: { type: 'string', format: 'date-time', nullable: true },
                  phone: { type: 'string', example: '+961 1234567' },
                  phoneNumber: { type: 'string', example: '1234567' },
                  hourlyRate: { type: 'number', example: 50.0, nullable: true },
                  followers: { type: 'number', example: 100 },
                  isVerified: { type: 'boolean', example: true },
                  professionId: { type: 'number', example: 1 },
                  addedDate: { type: 'string', format: 'date-time', nullable: true },
                  bio: { type: 'string', example: 'Experienced software developer' },
                  yearsOfExperience: { type: 'number', example: 5 },
                  reviewCount: { type: 'number', example: 100 },
                  email: { type: 'string', example: 'john.doe@example.com', nullable: true },
                  website: { type: 'string', example: 'https://example.com', nullable: true },
                  address: { type: 'string', example: '123 Main St', nullable: true },
                  gender: { type: 'string', example: 'male', nullable: true },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 100 },
                limit: { type: 'number', example: 50 },
                page: { type: 'number', example: 1 },
                totalPages: { type: 'number', example: 2 },
              },
            },
            meta: {
              type: 'object',
              properties: {
                showTop: { type: 'boolean', example: true },
              },
            },
            message: { type: 'string', example: 'Specialists retrieved successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 500),
    ),

  /**
   * POST /api/admin/specialists/remove-specialist - Remove specialist (admin)
   */
  removeSpecialist: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Remove specialist',
        description: 'Remove a user from specialists. Sets is_specialist = 0. Admin only.',
      }),
      ApiBody({ type: RemoveSpecialistDto }),
      ApiResponse({
        status: 200,
        description: 'User removed from Top Specialists',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User removed from Top Specialists' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 500),
    ),
};
