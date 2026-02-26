import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Chat WebSocket Server Service
 * Pure Broadcast WebSocket Server - ZERO Database Operations
 * 
 * This service handles real-time broadcasting to connected clients.
 * ALL data operations (fetch, save, update, delete) MUST be done via REST API first.
 * 
 * Note: For full WebSocket gateway implementation, install @nestjs/websockets
 * and create a proper @WebSocketGateway class
 */
@Injectable()
export class ChatWebSocketServerService {
  private readonly logger = new Logger(ChatWebSocketServerService.name);
  private clients: Map<string, any> = new Map(); // userId => connection
  private readonly port: number;

  constructor(private readonly configService: ConfigService) {
    this.port = this.configService.get<number>('CHAT_WEBSOCKET_PORT') || 8093;
  }

  /**
   * Handle user login - BROADCAST ONLY
   * Frontend should call REST API first to validate credentials
   */
  async handleLogin(connection: any, userId: string, userInfo?: any): Promise<void> {
    if (!userId) {
      connection.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing required parameter: user',
        }),
      );
      return;
    }

    try {
      // Store connection
      (connection as any).user = userId;
      this.clients.set(userId, connection);

      this.logger.log(`User ${userId} connected`);

      connection.send(
        JSON.stringify({
          type: 'login_success',
          user: userId,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      connection.send(
        JSON.stringify({
          type: 'error',
          message: 'Login failed',
        }),
      );
    }
  }

  /**
   * Broadcast new message - BROADCAST ONLY
   * REST API must save message to database first
   */
  async handleChat(connection: any, messageData: any): Promise<void> {
    if (!messageData.from || !messageData.to) {
      connection.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing required parameters: from, to',
        }),
      );
      return;
    }

    try {
      const broadcastData = {
        type: 'new_message',
        message: {
          id: messageData.id || null,
          conversation_id: messageData.conversation_id || null,
          sender_id: messageData.from,
          receiver_id: messageData.to,
          sender_name: messageData.sender_name || 'Unknown',
          message: messageData.message || '',
          message_type: messageData.message_type || 'text',
          timestamp: messageData.timestamp || new Date().toISOString(),
          formatted_time: messageData.formatted_time || new Date().toLocaleTimeString(),
          is_read: messageData.is_read || false,
          product_id: messageData.product_id || null,
          reply: messageData.reply || null,
          file: messageData.file || null,
          product_details: messageData.product_details || null,
        },
      };

      // Broadcast to receiver
      const receiverConnection = this.clients.get(messageData.to);
      if (receiverConnection) {
        receiverConnection.send(JSON.stringify(broadcastData));
      }

      // Confirm to sender
      connection.send(
        JSON.stringify({
          type: 'message_delivered',
          message_id: messageData.id,
          conversation_id: messageData.conversation_id,
          timestamp: messageData.timestamp || new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.error(`Broadcast error: ${error.message}`);
    }
  }

  /**
   * Broadcast message edit - BROADCAST ONLY
   */
  async handleEditMessage(connection: any, messageData: any): Promise<void> {
    if (!messageData.message_id || !messageData.sender_id || !messageData.receiver_id) {
      return;
    }

    try {
      const editNotification = {
        type: 'message_edited',
        message_id: Number(messageData.message_id),
        conversation_id: Number(messageData.conversation_id || 0),
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        sender_name: messageData.sender_name || 'Unknown',
        message: messageData.message,
        edited_by: messageData.edited_by || messageData.sender_id,
        timestamp: messageData.timestamp || new Date().toISOString(),
        formatted_time: messageData.formatted_time || new Date().toLocaleTimeString(),
      };

      const receiverConnection = this.clients.get(messageData.receiver_id);
      if (receiverConnection) {
        receiverConnection.send(JSON.stringify(editNotification));
      }

      const senderConnection = this.clients.get(messageData.sender_id);
      if (senderConnection) {
        senderConnection.send(JSON.stringify(editNotification));
      }
    } catch (error) {
      this.logger.error(`Edit broadcast error: ${error.message}`);
    }
  }

  /**
   * Broadcast message deletion - BROADCAST ONLY
   */
  async handleDeleteMessage(connection: any, messageData: any): Promise<void> {
    if (!messageData.message_id || !messageData.sender_id || !messageData.receiver_id) {
      return;
    }

    try {
      const deleteNotification = {
        type: 'message_deleted',
        message_id: Number(messageData.message_id),
        conversation_id: Number(messageData.conversation_id || 0),
        deleted_by: messageData.deleted_by || messageData.sender_id,
        timestamp: messageData.timestamp || new Date().toISOString(),
      };

      const receiverConnection = this.clients.get(messageData.receiver_id);
      if (receiverConnection) {
        receiverConnection.send(JSON.stringify(deleteNotification));
      }

      const senderConnection = this.clients.get(messageData.sender_id);
      if (senderConnection) {
        senderConnection.send(JSON.stringify(deleteNotification));
      }
    } catch (error) {
      this.logger.error(`Delete broadcast error: ${error.message}`);
    }
  }

  /**
   * Broadcast conversation read - BROADCAST ONLY
   */
  async handleConversationRead(connection: any, messageData: any): Promise<void> {
    if (!messageData.conversation_id || !messageData.reader_id) {
      return;
    }

    try {
      connection.send(
        JSON.stringify({
          type: 'conversation_read',
          conversation_id: Number(messageData.conversation_id),
          updated_count: Number(messageData.updated_count || 0),
          message_ids: messageData.message_ids || [],
          timestamp: messageData.timestamp || new Date().toISOString(),
        }),
      );

      // Notify all senders
      const senderIds = Array.from(new Set(messageData.sender_ids || []));
      for (const senderId of senderIds) {
        const senderConnection = this.clients.get(String(senderId));
        if (senderConnection) {
          senderConnection.send(
            JSON.stringify({
              type: 'conversation_read_notification',
              conversation_id: Number(messageData.conversation_id),
              reader_id: messageData.reader_id,
              message_ids: messageData.message_ids || [],
              updated_count: Number(messageData.updated_count || 0),
              timestamp: messageData.timestamp || new Date().toISOString(),
            }),
          );
        }
      }
    } catch (error) {
      this.logger.error(`Conversation read error: ${error.message}`);
    }
  }

  /**
   * Broadcast single message read - BROADCAST ONLY
   */
  async handleMessageRead(connection: any, messageData: any): Promise<void> {
    if (!messageData.message_id || !messageData.sender_id) {
      return;
    }

    try {
      const senderConnection = this.clients.get(messageData.sender_id);
      if (senderConnection) {
        senderConnection.send(
          JSON.stringify({
            type: 'message_read',
            message_id: Number(messageData.message_id),
            conversation_id: Number(messageData.conversation_id || 0),
            reader_id: messageData.reader_id || null,
            timestamp: messageData.timestamp || new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Message read error: ${error.message}`);
    }
  }

  /**
   * Broadcast typing status - BROADCAST ONLY
   */
  async handleTypingStatus(connection: any, messageData: any): Promise<void> {
    if (!messageData.sender_id || !messageData.receiver_id || !messageData.conversation_id) {
      return;
    }

    try {
      const isTyping = messageData.type === 'typing_started';
      const receiverConnection = this.clients.get(messageData.receiver_id);
      if (receiverConnection) {
        receiverConnection.send(
          JSON.stringify({
            type: isTyping ? 'typing_started' : 'typing_stopped',
            user_id: messageData.sender_id,
            conversation_id: messageData.conversation_id,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      this.logger.error(`Typing status error: ${error.message}`);
    }
  }

  /**
   * Send data to client (from REST API)
   * Used when REST API needs to send data to WebSocket clients
   */
  async sendDataToClient(userId: string, data: any): Promise<void> {
    const connection = this.clients.get(userId);
    if (connection) {
      connection.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast to multiple users
   */
  async broadcastToUsers(userIds: string[], data: any): Promise<void> {
    const message = JSON.stringify(data);
    for (const userId of userIds) {
      const connection = this.clients.get(userId);
      if (connection) {
        connection.send(message);
      }
    }
  }

  /**
   * Handle user disconnect
   */
  async handleDisconnect(userId: string): Promise<void> {
    if (userId) {
      this.clients.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }
}
