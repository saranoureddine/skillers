import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';
import { PaginationParams } from '@/lib/api/types';

/**
 * Categories Service
 * Handles all category-related API calls
 * Base URL: /api/public/categories
 */

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  isActive: number;
  isTop: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

class CategoriesService {
  /**
   * Get all categories
   */
  async getCategories(params?: PaginationParams & { parentId?: number }): Promise<PaginatedResponse<Category>> {
    try {
      const response = await apiClient.get('/public/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    try {
      const response = await apiClient.get(`/public/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get top categories
   */
  async getTopCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await apiClient.get('/public/categories/top');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get subcategories
   */
  async getSubcategories(parentId: number): Promise<ApiResponse<Category[]>> {
    try {
      const response = await apiClient.get(`/public/categories/${parentId}/subcategories`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
