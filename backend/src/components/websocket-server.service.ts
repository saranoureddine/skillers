import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
// Note: For production, install ioredis: npm install ioredis
// Using in-memory store for now

/**
 * WebSocket Server Service
 * Manages WebSocket connections and messaging
 * Note: For full WebSocket gateway, install @nestjs/websockets and use @WebSocketGateway
 */
@Injectable()
export class WebSocketServerService {
  private readonly logger = new Logger(WebSocketServerService.name);
  private redisStore: Map<string, string> = new Map(); // Simple in-memory store (replace with Redis in production)
  private connections: Map<string, any> = new Map(); // userId => connection

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    // TODO: Initialize Redis connection for production
    // const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    // this.redis = new Redis(redisUrl);
  }

  /**
   * Handle user connection
   */
  async onOpen(userId: string, connection: any): Promise<void> {
    if (!userId) {
      connection.close();
      return;
    }

    this.redisStore.set(`websocket:user:${userId}`, userId);
    this.connections.set(userId, connection);
    this.logger.log(`User ${userId} connected`);
  }

  /**
   * Handle user disconnection
   */
  async onClose(userId: string): Promise<void> {
    if (userId) {
      this.redisStore.delete(`websocket:user:${userId}`);
      this.connections.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  /**
   * Send message to specific client
   */
  async sendToClient(userId: string, message: any): Promise<boolean> {
    try {
      const exists = this.redisStore.has(`websocket:user:${userId}`);
      if (exists && this.connections.has(userId)) {
        const connection = this.connections.get(userId);
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        connection.send(messageStr);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error sending to client ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const exists = this.redisStore.has(`websocket:user:${userId}`);
      return exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Broadcast message to all connected users
   */
  async broadcastMessage(message: any): Promise<void> {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    for (const [userId, connection] of this.connections.entries()) {
      try {
        connection.send(messageStr);
      } catch (error) {
        this.logger.error(`Error broadcasting to ${userId}: ${error.message}`);
      }
    }
  }

  /**
   * Broadcast new user connected/disconnected
   */
  async broadcastNewUserConnected(user: any, eventType: 'user_connected' | 'user_disconnected'): Promise<void> {
    const message = {
      type: eventType,
      id: user.user_id || user.id,
      user_name: user.user_name || user.firstName + ' ' + user.lastName,
      user_full_name: (user.first_name || user.firstName || '') + ' ' + (user.last_name || user.lastName || ''),
    };

    await this.broadcastMessage(message);
  }

  /**
   * Close all connections
   */
  async closeAllConnections(): Promise<void> {
    for (const [userId, connection] of this.connections.entries()) {
      try {
        this.redisStore.delete(`websocket:user:${userId}`);
        connection.close();
      } catch (error) {
        this.logger.error(`Error closing connection for ${userId}: ${error.message}`);
      }
    }
    this.connections.clear();
  }

  /**
   * Handle incoming message
   */
  async onMessage(userId: string, message: any): Promise<void> {
    try {
      const messageData = typeof message === 'string' ? JSON.parse(message) : message;

      if (messageData.type === 'user_connected' || messageData.type === 'user_disconnected') {
        // Get user from database
        const user = await this.dataSource.query(
          `
          SELECT user_id, first_name, last_name, user_name
          FROM ag_users
          WHERE user_id = ?
          LIMIT 1
          `,
          [messageData.user_id],
        );

        if (user && user.length > 0) {
          await this.broadcastNewUserConnected(user[0], messageData.type);
        }
      } else if (messageData.type === 'quote') {
        // Send to target client
        await this.sendToClient(messageData.targetId, message);
      } else if (messageData.targetId) {
        // Send to target client
        await this.sendToClient(messageData.targetId, message);
      }
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
    }
  }
}
