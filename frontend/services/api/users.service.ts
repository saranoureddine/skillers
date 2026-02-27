import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';
import { User, AuthResponse, LoginCredentials, RegisterData, PaginationParams } from '@/lib/api/types';

/**
 * Users Service
 * Handles all user-related API calls
 * Base URL: /api/public/users, /api/users, /api/admin/users
 */

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  bio?: string;
  [key: string]: any;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  phoneNumber: string;
  countryCode: string;
}

export interface VerifyResetCodeData {
  phoneNumber: string;
  countryCode: string;
  code: string;
}

export interface ResetPasswordData {
  phoneNumber: string;
  countryCode: string;
  code: string;
  newPassword: string;
}

export interface PhoneVerificationData {
  phoneNumber: string;
  countryCode: string;
}

export interface VerifyPhoneCodeData {
  phoneNumber: string;
  countryCode: string;
  code: string;
}

export interface SetUserCitiesData {
  cityIds: number[];
}

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
}

class UsersService {
  /**
   * Public Endpoints
   */

  /**
   * Health check
   */
  async health(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get('/public/users/health');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData, files?: { coverImage?: File; cv?: File }): Promise<ApiResponse<AuthResponse>> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add files
      if (files?.coverImage) {
        formData.append('files', files.coverImage);
        formData.append('cover_image', files.coverImage);
      }
      if (files?.cv) {
        formData.append('files', files.cv);
        formData.append('cv', files.cv);
      }

      const response = await apiClient.post('/public/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store token if registration successful
      if (response.data?.data?.token) {
        localStorage.setItem(
          process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token',
          response.data.data.token
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post('/public/users/login', credentials);
      
      // Store token if login successful
      if (response.data?.data?.token) {
        localStorage.setItem(
          process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token',
          response.data.data.token
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Logout user (clear token)
   */
  logout(): void {
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token');
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/public/users/me');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Verify reset code
   */
  async verifyResetCode(data: VerifyResetCodeData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/verify-reset-code', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    data: UpdateProfileData,
    files?: { coverImage?: File; coverVideo?: File; mainImage?: File; image?: File }
  ): Promise<ApiResponse<User>> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files
      if (files?.coverImage) {
        formData.append('files', files.coverImage);
        formData.append('cover_image', files.coverImage);
      }
      if (files?.coverVideo) {
        formData.append('files', files.coverVideo);
        formData.append('cover_video', files.coverVideo);
      }
      if (files?.mainImage) {
        formData.append('files', files.mainImage);
        formData.append('main_image', files.mainImage);
      }
      if (files?.image) {
        formData.append('files', files.image);
        formData.append('image', files.image);
      }

      const response = await apiClient.patch('/public/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerification(data: PhoneVerificationData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/send-phone-verification', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Verify phone code
   */
  async verifyPhoneCode(data: VerifyPhoneCodeData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/verify-phone-code', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Register with verified phone
   */
  async registerVerified(data: RegisterData & { code: string }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post('/public/users/register-verified', data);
      
      // Store token if registration successful
      if (response.data?.data?.token) {
        localStorage.setItem(
          process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token',
          response.data.data.token
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Set user cities
   */
  async setUserCities(data: SetUserCitiesData): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/users/set-cities', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user location
   */
  async updateLocation(data: UpdateLocationData): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch('/public/users/location', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Shared Endpoints (Authenticated)
   */

  /**
   * Get all users (paginated)
   */
  async getAllUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Admin Endpoints
   */

  /**
   * Create user (admin only)
   */
  async createUser(data: any): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post('/admin/users', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id: string, data: any): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.patch(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/admin/users/${id}`, {
        data: { id },
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get all users with filters (admin only)
   */
  async getAllUsersAdmin(params?: PaginationParams & { search?: string; cityId?: number; [key: string]: any }): Promise<any> {
    try {
      const response = await apiClient.get('/admin/users/get-all-users', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get user details by ID (admin only)
   */
  async getUserDetails(userId: string): Promise<any> {
    try {
      const response = await apiClient.get('/admin/users/get-user-details', { params: { id: userId } });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const usersService = new UsersService();
export default usersService;
