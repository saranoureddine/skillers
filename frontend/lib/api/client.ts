import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * Base API Client Configuration
 * Handles authentication, error handling, and request/response interceptors
 */

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage - check multiple possible keys
    let token = null;
    if (typeof window !== 'undefined') {
      // Try ag-users token first (from admin login)
      token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'skillers_jwt_token');
      
      // Fallback to auth token
      if (!token) {
        token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token');
      }
      
      // Fallback: try to get token from user object
      if (!token) {
        const userStr = localStorage.getItem('user') || localStorage.getItem('skillers_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            token = user.token;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    // Add token to Authorization header if available
    // Backend accepts both "Bearer <token>" and "Token <token>" formats
    if (token && config.headers) {
      // Remove any existing Bearer/Token prefix if present
      const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
      // Use Bearer format (backend strategy accepts both)
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'skillers_auth_token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

/**
 * API Response wrapper type
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    if (apiError?.message) {
      return apiError.message;
    }
    if (apiError?.error) {
      return apiError.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;
