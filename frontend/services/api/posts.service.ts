import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';
import { PaginationParams } from '@/lib/api/types';

/**
 * Posts Service
 * Handles all post-related API calls
 * Base URL: /api/public/posts, /api/posts, /api/admin/posts
 */

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'video';
  filePath?: string;
  isPublic: number;
  isPinned: number;
  isDeleted: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  type?: 'text' | 'image' | 'video';
  isPublic?: number;
  file?: File;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: string;
}

class PostsService {
  /**
   * Public Endpoints
   */

  /**
   * Get all posts (feed)
   */
  async getPosts(params?: PaginationParams & { userId?: string }): Promise<PaginatedResponse<Post>> {
    try {
      const response = await apiClient.get('/public/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.get(`/public/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.type) {
        formData.append('type', data.type);
      }
      if (data.isPublic !== undefined) {
        formData.append('isPublic', data.isPublic.toString());
      }
      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await apiClient.post('/public/posts', formData, {
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
   * Update a post
   */
  async updatePost(id: string, data: Partial<CreatePostData>): Promise<ApiResponse<Post>> {
    try {
      const formData = new FormData();
      if (data.content) formData.append('content', data.content);
      if (data.type) formData.append('type', data.type);
      if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());
      if (data.file) formData.append('file', data.file);

      const response = await apiClient.patch(`/public/posts/${id}`, formData, {
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
   * Delete a post
   */
  async deletePost(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post(`/public/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string, params?: PaginationParams): Promise<PaginatedResponse<Comment>> {
    try {
      const response = await apiClient.get(`/public/posts/${postId}/comments`, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Create a comment
   */
  async createComment(data: CreateCommentData): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiClient.post('/public/posts/comments', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await apiClient.patch(`/public/posts/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/posts/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Admin Endpoints
   */

  /**
   * Get all posts (admin)
   */
  async getAllPostsAdmin(params?: PaginationParams): Promise<PaginatedResponse<Post>> {
    try {
      const response = await apiClient.get('/admin/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Pin a post (admin)
   */
  async pinPost(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.patch(`/admin/posts/${id}/pin`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Unpin a post (admin)
   */
  async unpinPost(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.patch(`/admin/posts/${id}/unpin`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const postsService = new PostsService();
export default postsService;
