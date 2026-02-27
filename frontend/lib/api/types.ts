/**
 * Common API Types and Interfaces
 * Shared types used across all API services
 */

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Base Entity with common fields
 */
export interface BaseEntity {
  id: string | number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * User Entity
 */
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email?: string | null;
  countryCode: string;
  phoneNumber: string;
  isActivated: number;
  isGuest: number;
  mainImage?: string | null;
  coverImage?: string | null;
  location?: string | null;
  isOnline?: number;
  isSpecialist?: number;
  specialistVerified?: number;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: string;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  phoneNumber: string;
  countryCode: string;
  password: string;
}

/**
 * Register Data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  email?: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * Paginated Response
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
 * Error Response
 */
export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
