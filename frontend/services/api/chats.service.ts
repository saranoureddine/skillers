import apiClient, { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';
import { PaginationParams } from '@/lib/api/types';

/**
 * Chats Service
 * Handles all chat-related API calls
 * Base URL: /api/public/chats, /api/chats, /api/admin/chats
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'voice';
  filePath?: string;
  isRead: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  id: string;
  userOne: string;
  userTwo: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  receiverId: string;
  message: string;
  type?: 'text' | 'image' | 'file' | 'voice';
  file?: File;
}

class ChatsService {
  /**
   * Public Endpoints
   */

  /**
   * Get all conversations for current user
   */
  async getConversations(params?: PaginationParams): Promise<PaginatedResponse<ChatConversation>> {
    try {
      const response = await apiClient.get('/public/chats/conversations', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params?: PaginationParams): Promise<PaginatedResponse<ChatMessage>> {
    try {
      const response = await apiClient.get(`/public/chats/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<ChatMessage>> {
    try {
      const formData = new FormData();
      formData.append('receiverId', data.receiverId);
      formData.append('message', data.message);
      if (data.type) {
        formData.append('type', data.type);
      }
      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await apiClient.post('/public/chats/messages', formData, {
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
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch(`/public/chats/conversations/${conversationId}/read`, {
        messageIds,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/chats/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/public/chats/block', { userId });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete(`/public/chats/block/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/public/chats/blocked');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Shared Endpoints
   */

  /**
   * Get conversation by ID
   */
  async getConversationById(id: string): Promise<ApiResponse<ChatConversation>> {
    try {
      const response = await apiClient.get(`/chats/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Admin Endpoints
   */

  /**
   * Get all conversations (admin)
   */
  async getAllConversationsAdmin(params?: PaginationParams): Promise<PaginatedResponse<ChatConversation>> {
    try {
      const response = await apiClient.get('/admin/chats/conversations', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get all messages (admin)
   */
  async getAllMessagesAdmin(params?: PaginationParams): Promise<PaginatedResponse<ChatMessage>> {
    try {
      const response = await apiClient.get('/admin/chats/messages', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const chatsService = new ChatsService();
export default chatsService;
