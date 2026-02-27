import apiClient, { getErrorMessage } from '@/lib/api/client';

/**
 * Ag Users Service (Admin/Dashboard Users)
 * Handles all ag-users API calls
 * Base URL: /api/admin/ag-users
 */

export interface AgUser {
  userId: string;
  userName: string;
  userPassword?: string;
  userRole: number;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumberOne?: string;
  phoneNumberTwo?: string;
  active?: string;
  token?: string;
  country?: string;
  address?: string;
  dateOfBirth?: string;
  centerNum?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  resetCode?: string;
  resetCodeDate?: string;
  images?: any[];
  cities?: number[];
  stores?: any[];
  mainImage?: string;
}

export interface AgUserPermission {
  table_name: string;
  title: string;
  group_name: string;
  group_description: string | null;
  create: boolean;
  update: boolean;
  delete: boolean;
  view: boolean;
}

export interface AgLoginCredentials {
  login: string;
  password: string;
}

export interface AgLoginResponse {
  succeeded: boolean;
  message?: string;
  user: AgUser;
  permissions: AgUserPermission[];
  // Token is not returned in response - stored in DB for auth headers only
}

export interface AgChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface AgForgotPasswordData {
  country_code: string;
  phone_number: string;
}

export interface AgCheckResetCodeData {
  country_code: string;
  phone_number: string;
  code: string;
}

export interface AgResetPasswordData {
  country_code: string;
  phone_number: string;
  user_password: string;
}

class AgUsersService {
  private readonly BASE = '/admin/ag-users';

  /**
   * Login (public endpoint — no auth required)
   */
  async login(credentials: AgLoginCredentials): Promise<AgLoginResponse> {
    try {
      const response = await apiClient.post(`${this.BASE}/login`, credentials);

      // Response might be wrapped in data property (from TransformInterceptor)
      const responseData = response.data?.data || response.data || response;

      // Store user and permissions on successful login
      // Note: Token is not returned - it's stored in DB and used via Authorization header
      if (responseData?.succeeded && responseData?.user) {
        localStorage.setItem(
          'skillers_permissions',
          JSON.stringify(responseData.permissions ?? []),
        );
        localStorage.setItem(
          'skillers_user',
          JSON.stringify(responseData.user ?? {}),
        );
        localStorage.setItem('session', 'true');
      }

      return responseData;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Logout — clear stored session data
   */
  logout(): void {
    localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'skillers_jwt_token');
    localStorage.removeItem('skillers_permissions');
    localStorage.removeItem('skillers_user');
    localStorage.removeItem('session');
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): AgUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('skillers_user');
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Get stored permissions from localStorage
   */
  getStoredPermissions(): AgUserPermission[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('skillers_permissions');
    return raw ? JSON.parse(raw) : [];
  }

  /**
   * Get languages list
   */
  async getLanguages(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE}/languages`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE}/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get all users (paginated)
   */
  async getAllUsers(params?: Record<string, any>): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE}/users`, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Create user
   */
  async createUser(data: Record<string, any>): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/users`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Record<string, any>): Promise<any> {
    try {
      const response = await apiClient.put(`${this.BASE}/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete user(s)
   */
  async deleteUsers(ids: string[]): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/users/delete`, { id: ids });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(data: AgChangePasswordData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/change-password`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: AgForgotPasswordData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/forgot-password`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Check reset code
   */
  async checkResetCode(data: AgCheckResetCodeData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/check-reset-code`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: AgResetPasswordData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.BASE}/reset-password`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get permissions for current user
   */
  async getPermissions(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE}/permissions`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const agUsersService = new AgUsersService();
export default agUsersService;
