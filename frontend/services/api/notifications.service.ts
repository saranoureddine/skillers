import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';
import { PaginationParams } from '@/lib/api/types';

/**
 * Notifications Service
 * Handles all notification-related API calls
 * Base URL: /api/public/notifications
 */

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: number;
  createdAt: string;
  updatedAt: string;
}

class NotificationsService {
  /**
   * Get all notifications for current user
   */
  async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    try {
      const response = await apiClient.get('/public/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await apiClient.get('/public/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch(`/public/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch('/public/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Record<string, boolean>): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch('/public/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
