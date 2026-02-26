import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateCityMemberDto,
  GetCityMemberDto,
  UpdateCityMemberDto,
  GetAllCityMembersDto,
  DeleteCityMemberDto,
} from '../dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Public CitiesMembers Controller Documentation
// ============================================================================

export const CitiesMembersPublicControllerDocs = {
  /**
   * Controller-level decorators for public cities members controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Cities Members'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/cities-members/create-city-member - Create a new city member
   */
  createCityMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a new city member',
        description: 'Creates a new city member (mayor, council member, etc.) for a specific city.',
      }),
      ApiBody({ type: CreateCityMemberDto }),
      ApiResponse({
        status: 201,
        description: 'City member created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                city_id: { type: 'string', example: '1' },
                name: { type: 'string', example: 'John Doe' },
                name_ar: { type: 'string', nullable: true, example: 'جون دو' },
                position_id: { type: 'string', nullable: true, example: '1' },
                email: { type: 'string', nullable: true, example: 'john.doe@city.gov.lb' },
                department_id: { type: 'string', nullable: true, example: '1' },
                is_active: { type: 'number', example: 1 },
                biography: { type: 'string', nullable: true },
                from_year: { type: 'string', example: '2023' },
                to_year: { type: 'string', nullable: true, example: '2027' },
                phone_number: { type: 'string', nullable: true, example: '+9611234567' },
                order_number: { type: 'number', nullable: true, example: 1 },
                main_image: { type: 'string', nullable: true },
                administration_term_id: { type: 'string', nullable: true },
                created_by: { type: 'string', example: 'user_created_by_id' },
                created_at: { type: 'string', format: 'date-time', example: '2023-01-01T10:00:00Z' },
                updated_at: { type: 'string', format: 'date-time', example: '2023-01-01T10:00:00Z' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 422, 500),
    ),

  /**
   * GET /api/public/cities-members/get-city-member?id= - Get a single city member
   */
  getCityMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get city member',
        description: 'Retrieve a single city member by ID.',
      }),
      ApiQuery({
        name: 'id',
        required: true,
        description: 'City Member ID',
        example: '507f1f77bcf86cd799439011',
        type: String,
      }),
      ApiResponse({
        status: 200,
        description: 'City member retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            member: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                city_id: { type: 'string', example: '1' },
                name: { type: 'string', example: 'John Doe' },
                name_ar: { type: 'string', nullable: true },
                role: { type: 'string', nullable: true },
                position_id: { type: 'string', nullable: true },
                email: { type: 'string', nullable: true },
                department_id: { type: 'string', nullable: true },
                is_active: { type: 'number', example: 1 },
                biography: { type: 'string', nullable: true },
                from_year: { type: 'string', example: '2023' },
                to_year: { type: 'string', nullable: true, example: '2027' },
                phone_number: { type: 'string', nullable: true },
                order_number: { type: 'number', nullable: true },
                main_image: { type: 'string', nullable: true },
                administration_term_id: { type: 'string', nullable: true },
                created_by: { type: 'string' },
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
   * POST /api/public/cities-members/update-city-member?id= - Update a city member
   */
  updateCityMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update city member',
        description: 'Update an existing city member. Only provided fields will be updated.',
      }),
      ApiQuery({
        name: 'id',
        required: true,
        description: 'City Member ID',
        example: '507f1f77bcf86cd799439011',
        type: String,
      }),
      ApiBody({ type: UpdateCityMemberDto }),
      ApiResponse({
        status: 200,
        description: 'City member updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            member: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                city_id: { type: 'string', example: '1' },
                name: { type: 'string', example: 'John Doe' },
                name_ar: { type: 'string', nullable: true },
                role: { type: 'string', nullable: true },
                position_id: { type: 'string', nullable: true },
                email: { type: 'string', nullable: true },
                department_id: { type: 'string', nullable: true },
                is_active: { type: 'number', example: 1 },
                biography: { type: 'string', nullable: true },
                from_year: { type: 'string', example: '2023' },
                to_year: { type: 'string', nullable: true, example: '2027' },
                phone_number: { type: 'string', nullable: true },
                order_number: { type: 'number', nullable: true },
                main_image: { type: 'string', nullable: true },
                administration_term_id: { type: 'string', nullable: true },
                updated_by: { type: 'string' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 422, 500),
    ),

  /**
   * GET /api/public/cities-members/get-all-city-members - Get all city members
   */
  getAllCityMembers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all city members',
        description: 'Retrieve all city members with pagination. Can be filtered by city_id. Results are ordered by position (Mayor first, then President, etc.), then by order_number, then by name. Includes images from attachments.',
      }),
      ApiQuery({
        name: 'city_id',
        required: false,
        description: 'Filter by city ID',
        example: '1',
        type: String,
      }),
      ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number',
        example: 1,
        type: Number,
      }),
      ApiQuery({
        name: 'per-page',
        required: false,
        description: 'Items per page',
        example: 20,
        type: Number,
      }),
      ApiResponse({
        status: 200,
        description: 'City members retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  city_id: { type: 'string', example: '1' },
                  name: { type: 'string', example: 'John Doe' },
                  name_ar: { type: 'string', nullable: true },
                  role: { type: 'string', nullable: true },
                  position_id: { type: 'string', nullable: true },
                  email: { type: 'string', nullable: true },
                  department_id: { type: 'string', nullable: true },
                  is_active: { type: 'number', example: 1 },
                  biography: { type: 'string', nullable: true },
                  from_year: { type: 'string', example: '2023' },
                  to_year: { type: 'string', nullable: true, example: '2027' },
                  phone_number: { type: 'string', nullable: true },
                  order_number: { type: 'number', nullable: true },
                  main_image: { type: 'string', nullable: true },
                  image: { type: 'string', nullable: true, example: 'http://localhost/uploads/members/image.jpg' },
                  administration_term_id: { type: 'string', nullable: true },
                  created_by: { type: 'string' },
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
   * DELETE /api/public/cities-members/delete-city-member?id= - Delete a city member
   */
  deleteCityMember: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete city member',
        description: 'Delete a city member by ID.',
      }),
      ApiQuery({
        name: 'id',
        required: true,
        description: 'City Member ID',
        example: '507f1f77bcf86cd799439011',
        type: String,
      }),
      ApiResponse({
        status: 200,
        description: 'City member deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'City member deleted' },
          },
        },
      }),
      ApiErrorResponses(401, 404, 500),
    ),
};
