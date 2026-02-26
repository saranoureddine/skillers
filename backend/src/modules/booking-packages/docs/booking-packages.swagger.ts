import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CreateBookingPackageDto, UpdateBookingPackageDto } from '../dto';
import { ApiErrorResponses } from '../../../common/swagger';

// ============================================================================
// Public BookingPackages Controller Documentation
// ============================================================================

export const BookingPackagesPublicControllerDocs = {
  /**
   * Controller-level decorators for public booking packages controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Booking Packages'),
    ),

  /**
   * GET /api/public/booking-packages - Get all booking packages
   */
  getAllPackages: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all booking packages',
        description: 'Retrieve all booking packages ordered by title.',
      }),
      ApiResponse({
        status: 200,
        description: 'Packages retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  title: { type: 'string', example: 'Basic Package' },
                  description: { type: 'string', nullable: true, example: 'This is a basic booking package' },
                  icon_image: { type: 'string', example: 'https://example.com/icons/package.png' },
                },
              },
            },
            total: { type: 'number', example: 5 },
          },
        },
      }),
      ApiErrorResponses(500),
    ),

  /**
   * GET /api/public/booking-packages/:id - Get single package by ID
   */
  getPackageById: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get booking package by ID',
        description: 'Retrieve a single booking package by its ID.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Package ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Package retrieved successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Basic Package' },
                description: { type: 'string', nullable: true, example: 'This is a basic booking package' },
                icon_image: { type: 'string', example: 'https://example.com/icons/package.png' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(404, 500),
    ),

  /**
   * POST /api/public/booking-packages - Create booking package
   */
  createPackage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create booking package',
        description: 'Create a new booking package. Title and icon_image are required.',
      }),
      ApiBody({ type: CreateBookingPackageDto }),
      ApiResponse({
        status: 200,
        description: 'Package created successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Package created successfully' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Basic Package' },
                description: { type: 'string', nullable: true, example: 'This is a basic booking package' },
                icon_image: { type: 'string', example: 'https://example.com/icons/package.png' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 500),
    ),

  /**
   * PUT/PATCH /api/public/booking-packages/:id - Update booking package
   */
  updatePackage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update booking package',
        description: 'Update an existing booking package. Only provided fields will be updated.',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Package ID',
        example: 1,
      }),
      ApiBody({ type: UpdateBookingPackageDto }),
      ApiResponse({
        status: 200,
        description: 'Package updated successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Package updated successfully' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Basic Package' },
                description: { type: 'string', nullable: true, example: 'This is a basic booking package' },
                icon_image: { type: 'string', example: 'https://example.com/icons/package.png' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 404, 500),
    ),

  /**
   * DELETE /api/public/booking-packages/:id - Delete booking package
   */
  deletePackage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete booking package',
        description: 'Delete a booking package (hard delete).',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'Package ID',
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: 'Package deleted successfully',
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Package deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(404, 500),
    ),
};
