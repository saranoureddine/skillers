import { applyDecorators } from '@nestjs/common';
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
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneCodeDto, RegisterVerifiedDto } from '../dto/phone-verification.dto';
import { SetUserCitiesDto } from '../dto/set-user-cities.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { DeleteUserDto } from '../dto/delete-user.dto';
import { GetAllUsersQueryDto } from '../dto/get-all-users.dto';
import {
  ApiPaginatedResponse,
  ApiItemResponse,
  ApiCreatedResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Shared Users Controller Documentation
// ============================================================================

export const UsersControllerDocs = {
  /**
   * Controller-level decorators for shared users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Users'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/users - List all users (paginated)
   */
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all users',
        description: 'Retrieve a paginated list of all users. Accessible by authenticated users.',
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
      ApiPaginatedResponse(UserEntity),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/users/:id - Get user by ID
   */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieve a single user by their ID. Accessible by authenticated users.',
      }),
      ApiParam({
        name: 'id',
        type: String,
        description: 'User ID (20 character string)',
        example: 'e87b786bac5234367b4a',
      }),
      ApiItemResponse(UserEntity, 'User retrieved successfully'),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};


// ============================================================================
// Public Users Controller Documentation
// ============================================================================

export const UsersPublicControllerDocs = {
  /**
   * Controller-level decorators for public users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Users'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * GET /api/public/users/profile - Get current user profile
   */
  getProfile: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get current user profile',
        description: 'Retrieve the authenticated user\'s own profile information.',
      }),
      ApiItemResponse(UserEntity, 'Profile retrieved successfully'),
      ApiErrorResponses(401, 404, 500),
    ),

  /**
   * PATCH /api/public/users/profile - Update current user profile
   */
  updateProfile: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update current user profile',
        description:
          'Update the authenticated user\'s own profile. Users cannot change their own role.',
      }),
      ApiBody({
        type: UpdateUserDto,
        description: 'Profile update data (role field will be ignored)',
        examples: {
          example1: {
            summary: 'Update profile details',
            value: {
              firstName: 'John',
              lastName: 'Smith',
              phone: '+1234567890',
              avatar: 'https://example.com/avatar.jpg',
            },
          },
          example2: {
            summary: 'Change password',
            value: {
              password: 'NewSecurePassword123!',
            },
          },
        },
      }),
      ApiItemResponse(UserEntity, 'Profile updated successfully'),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/public/users/health - Health check
   */
  health: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Health check',
        description: 'Check if Users API is working',
      }),
      ApiResponse({
        status: 200,
        description: 'API is working',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Users API is working success' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '3.0.0' },
          },
        },
      }),
    ),

  /**
   * POST /api/public/users/register - Register new user
   */
  register: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Register new user',
        description: 'Register a new user account with email and phone',
      }),
      ApiBody({ type: RegisterDto }),
      ApiResponse({
        status: 200,
        description: 'User registered successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: { type: 'object' },
            token: { type: 'string' },
            message: { type: 'string', example: 'User registered successfully' },
          },
        },
      }),
      ApiErrorResponses(400, 409, 500),
    ),

  /**
   * POST /api/public/users/login - Login user
   */
  login: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Login user',
        description: 'Authenticate user with phone number and password',
      }),
      ApiBody({ type: LoginDto }),
      ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            user: { type: 'object' },
            token: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/users/forgot-password - Request password reset
   */
  forgotPassword: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Forgot password',
        description: 'Request password reset code via SMS',
      }),
      ApiBody({ type: ForgotPasswordDto }),
      ApiResponse({
        status: 200,
        description: 'Reset code sent',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Password reset code sent to your phone' },
            resetCode: { type: 'string', nullable: true },
          },
        },
      }),
      ApiErrorResponses(400, 404, 429, 500),
    ),

  /**
   * POST /api/public/users/verify-reset-code - Verify reset code
   */
  verifyResetCode: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Verify reset code',
        description: 'Verify the password reset code',
      }),
      ApiBody({ type: VerifyResetCodeDto }),
      ApiResponse({
        status: 200,
        description: 'Reset code verified',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Reset code verified' },
            verified: { type: 'boolean', example: true },
            phone: { type: 'string' },
            countryCode: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 500),
    ),

  /**
   * POST /api/public/users/reset-password - Reset password
   */
  resetPassword: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Reset password',
        description: 'Reset password with verified reset code',
      }),
      ApiBody({ type: ResetPasswordDto }),
      ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Password reset successfully' },
            token: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/users/change-password - Change password
   */
  changePassword: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Change password',
        description: 'Change password for authenticated user',
      }),
      ApiBody({ type: ChangePasswordDto }),
      ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Password changed successfully' },
            token: { type: 'string' },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * POST /api/public/users/send-phone-verification - Send phone verification code
   */
  sendPhoneVerification: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Send phone verification',
        description: 'Send verification code to phone number',
      }),
      ApiBody({ type: SendPhoneVerificationDto }),
      ApiResponse({
        status: 200,
        description: 'Verification code sent',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Verification code sent successfully' },
            phone: { type: 'string' },
            countryCode: { type: 'string' },
            expiresIn: { type: 'number', example: 600 },
            verificationCode: { type: 'string', nullable: true },
          },
        },
      }),
      ApiErrorResponses(400, 409, 429, 500),
    ),

  /**
   * POST /api/public/users/verify-phone-code - Verify phone code
   */
  verifyPhoneCode: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Verify phone code',
        description: 'Verify the phone verification code',
      }),
      ApiBody({ type: VerifyPhoneCodeDto }),
      ApiResponse({
        status: 200,
        description: 'Phone verified successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Phone number verified successfully' },
            verified: { type: 'boolean', example: true },
            phone: { type: 'string' },
            countryCode: { type: 'string' },
            verificationToken: { type: 'string' },
            expiresIn: { type: 'number', example: 1800 },
          },
        },
      }),
      ApiErrorResponses(400, 500),
    ),

  /**
   * POST /api/public/users/register-verified - Register with verified phone
   */
  registerVerified: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Register verified',
        description: 'Register user with verified phone number',
      }),
      ApiBody({ type: RegisterVerifiedDto }),
      ApiResponse({
        status: 200,
        description: 'User registered successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: { type: 'object' },
            token: { type: 'string' },
            message: { type: 'string', example: 'User registered successfully with phone verification' },
          },
        },
      }),
      ApiErrorResponses(400, 403, 409, 500),
    ),

  /**
   * POST /api/public/users/set-user-cities - Set user cities
   */
  setUserCities: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Set user cities',
        description: 'Set cities for authenticated user',
      }),
      ApiBody({ type: SetUserCitiesDto }),
      ApiResponse({
        status: 200,
        description: 'User cities set successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User Cities Created Successfully' },
            cities: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),

  /**
   * GET /api/public/users/get-user-cities - Get user cities
   */
  getUserCities: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get user cities',
        description: 'Get cities for authenticated user',
      }),
      ApiResponse({
        status: 200,
        description: 'User cities retrieved',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            cities: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/users/update-location - Update location
   */
  updateLocation: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update location',
        description: 'Update user location coordinates',
      }),
      ApiBody({ type: UpdateLocationDto }),
      ApiResponse({
        status: 200,
        description: 'Location updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Location updated successfully' },
            user: { type: 'object' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 500),
    ),
};

// ============================================================================
// Admin Users Controller Documentation (Updated)
// ============================================================================

export const UsersAdminControllerDocs = {
  /**
   * Controller-level decorators for admin users controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Users'),
      ApiBearerAuth('Token-auth'),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin or Super Admin role required',
      }),
    ),

  /**
   * GET /api/admin/users/get-all-users - Get all users (admin)
   */
  getAllUsers: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve paginated list of all users with search and filtering. Admin only.',
      }),
      ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term (searches in first name, last name, email, phone, ID)',
        example: 'John',
      }),
      ApiQuery({
        name: 'cityId',
        required: false,
        type: Number,
        description: 'Filter by city ID',
        example: 1,
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'perPage',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
        example: 10,
      }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            users: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                totalCount: { type: 'number', example: 100 },
                pageCount: { type: 'number', example: 10 },
                currentPage: { type: 'number', example: 1 },
                perPage: { type: 'number', example: 10 },
              },
            },
            tableName: { type: 'number', example: 210 },
            mainImageType: { type: 'number', example: 1 },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 500),
    ),

  /**
   * POST /api/admin/users/create-user - Create user (admin)
   */
  createUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create user',
        description: 'Create a new user account. Admin only.',
      }),
      ApiBody({ type: CreateUserDto }),
      ApiResponse({
        status: 201,
        description: 'User created successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User created successfully' },
            user: { type: 'object' },
            token: { type: 'string' },
            cities: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 409, 500),
    ),

  /**
   * POST /api/admin/users/update-user - Update user (admin)
   */
  updateUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update user',
        description: 'Update an existing user. Admin only.',
      }),
      ApiBody({ type: UpdateUserDto }),
      ApiResponse({
        status: 200,
        description: 'User updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User updated successfully' },
            user: { type: 'object' },
            cities: { type: 'array', items: { type: 'object' } },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 404, 409, 500),
    ),

  /**
   * POST /api/admin/users/delete-user - Delete user(s) (admin)
   */
  deleteUser: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete user(s)',
        description: 'Delete one or more users. Admin only.',
      }),
      ApiBody({ type: DeleteUserDto }),
      ApiResponse({
        status: 200,
        description: 'Users deleted successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            deletedUsers: { type: 'array', items: { type: 'string' } },
            notFound: { type: 'array', items: { type: 'string' }, nullable: true },
            failedToDelete: { type: 'array', items: { type: 'string' }, nullable: true },
          },
        },
      }),
      ApiErrorResponses(400, 401, 403, 500),
    ),
};
