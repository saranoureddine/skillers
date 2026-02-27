import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * AgUsers Swagger Documentation
 * All Swagger decorators for AgUsers endpoints
 */
export class AgUsersControllerDocs {
  static controller() {
    return applyDecorators(
      ApiTags('Ag Users'),
      ApiBearerAuth('Token-auth'),
    );
  }

  static getLanguages() {
    return applyDecorators(
      ApiOperation({ summary: 'Get available languages' }),
      ApiResponse({ status: 200, description: 'Languages retrieved successfully' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    );
  }

  static createUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Create a new admin user' }),
      ApiResponse({ status: 201, description: 'User created successfully' }),
      ApiResponse({ status: 400, description: 'Bad request' }),
      ApiResponse({ status: 409, description: 'Email or phone already exists' }),
    );
  }

  static getUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Get user by ID' }),
      ApiResponse({ status: 200, description: 'User retrieved successfully' }),
      ApiResponse({ status: 404, description: 'User not found' }),
    );
  }

  static getAllUsers() {
    return applyDecorators(
      ApiOperation({ summary: 'Get all users with pagination and filters' }),
      ApiResponse({ status: 200, description: 'Users retrieved successfully' }),
    );
  }

  static updateUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Update user' }),
      ApiResponse({ status: 200, description: 'User updated successfully' }),
      ApiResponse({ status: 404, description: 'User not found' }),
    );
  }

  static deleteUser() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete user(s)' }),
      ApiResponse({ status: 200, description: 'User(s) deleted successfully' }),
      ApiResponse({ status: 409, description: 'User cannot be deleted (linked to stores)' }),
    );
  }

  static login() {
    return applyDecorators(
      ApiOperation({ summary: 'Login admin user' }),
      ApiResponse({ status: 200, description: 'Login successful' }),
      ApiResponse({ status: 401, description: 'Invalid credentials' }),
    );
  }

  static changePassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Change password' }),
      ApiResponse({ status: 200, description: 'Password changed successfully' }),
      ApiResponse({ status: 401, description: 'Current password incorrect' }),
    );
  }

  static forgotPassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Request password reset code' }),
      ApiResponse({ status: 200, description: 'Reset code sent successfully' }),
      ApiResponse({ status: 404, description: 'User not found' }),
    );
  }

  static checkResetCode() {
    return applyDecorators(
      ApiOperation({ summary: 'Verify reset code' }),
      ApiResponse({ status: 200, description: 'Code verified successfully' }),
      ApiResponse({ status: 400, description: 'Invalid or expired code' }),
    );
  }

  static resetPassword() {
    return applyDecorators(
      ApiOperation({ summary: 'Reset password with code' }),
      ApiResponse({ status: 200, description: 'Password reset successfully' }),
      ApiResponse({ status: 400, description: 'Invalid code or expired' }),
    );
  }

  static getPermissions() {
    return applyDecorators(
      ApiOperation({ summary: 'Get user permissions' }),
      ApiResponse({ status: 200, description: 'Permissions retrieved successfully' }),
    );
  }
}
