import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddUpdateAddressDto } from '../dto/add-update-address.dto';
import { RemoveAddressDto } from '../dto/remove-address.dto';
import {
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Public Addresses Controller Documentation
// ============================================================================

export const AddressesPublicControllerDocs = {
  /**
   * Controller-level decorators for public addresses controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Addresses'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/addresses/get-addresses - Get addresses
   */
  getAddresses: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get addresses',
        description: 'Retrieve all addresses for the authenticated user along with countries list.',
      }),
      ApiResponse({
        status: 200,
        description: 'Addresses retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: '' },
            addresses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  address_id: { type: 'string', example: 'e87b786bac5234367b4a' },
                  user_id: { type: 'string', example: 'e87b786bac5234367b4a' },
                  first_name: { type: 'string', example: 'John' },
                  last_name: { type: 'string', example: 'Doe' },
                  country_code: { type: 'string', example: '+961' },
                  phone_number: { type: 'string', example: '1234567' },
                  latitude: { type: 'number', nullable: true, example: 33.8938 },
                  longitude: { type: 'number', nullable: true, example: 35.5018 },
                  address: { type: 'string', example: '123 Main Street' },
                  country_id: { type: 'string', nullable: true },
                  city_id: { type: 'string', nullable: true },
                  route_name: { type: 'string', example: 'Route 1' },
                  building_name: { type: 'string', example: 'Building A' },
                  floor_number: { type: 'number', example: 5 },
                  country_name: { type: 'string', nullable: true },
                  city_name: { type: 'string', nullable: true },
                },
              },
            },
            countries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '1' },
                  name: { type: 'string', example: 'Lebanon' },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/addresses/get-selected-cities - Get selected cities
   */
  getSelectedCities: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get selected cities',
        description: 'Retrieve selected cities for the authenticated user.',
      }),
      ApiResponse({
        status: 200,
        description: 'Cities retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: '' },
            cities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  city_id: { type: 'string', example: '1' },
                  city_name: { type: 'string', example: 'Beirut' },
                },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/addresses/add-update-address - Add or update address
   */
  addUpdateAddress: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Add or update address',
        description: 'Create a new address or update an existing one. Include addressId for update, omit for create.',
      }),
      ApiBody({ type: AddUpdateAddressDto }),
      ApiResponse({
        status: 200,
        description: 'Address added or updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'address updted or added succ' },
            address: { type: 'object' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/addresses/remove-address - Remove address
   */
  removeAddress: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Remove address',
        description: 'Delete an address by its ID.',
      }),
      ApiBody({ type: RemoveAddressDto }),
      ApiResponse({
        status: 200,
        description: 'Address removed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'address deleted successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};
