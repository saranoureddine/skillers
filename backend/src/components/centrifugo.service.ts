import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as http from 'http';
import { JwtHelperService } from './jwt-helper.service';

/**
 * Centrifugo Service - Real-time messaging service using Centrifugo
 */
@Injectable()
export class CentrifugoService {
  private readonly centrifugoUrl: string;
  private readonly hmacSecret: string;
  private readonly httpApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtHelper: JwtHelperService,
  ) {
    this.centrifugoUrl = this.configService.get<string>('CENTRIFUGO_URL') || 'https://chatgpts.co';
    this.hmacSecret =
      this.configService.get<string>('CENTRIFUGO_HMAC_SECRET') ||
      'LdBaS5RPuMjHPW-JqDB34dYvYDGvB3SUfBwZLQNjhF3_nUygtK3uYUrhHt0ApfzIzql4F2Rdiv4e_Fxwvw8IVg';
    this.httpApiKey =
      this.configService.get<string>('CENTRIFUGO_HTTP_API_KEY') ||
      'Bdibvoxd0GcGjRG2DVQZ4twyaoSz8KcQ9pXQ5_aKQMFcV-e61-RaGJKbY323Tp3IxdBuf-ZtNWMO4SYwBPAjTg';
  }

  /**
   * Generate connection token for client
   */
  generateConnectionToken(userId: string, exp: number = 86400): string {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      sub: String(userId),
      exp: now + exp,
      iat: now,
      jti: this.generateRandomId(),
    };

    return this.jwtHelper.sign(claims, this.hmacSecret, { algorithm: 'HS256' });
  }

  /**
   * Generate subscription token for specific channel
   */
  generateSubscriptionToken(userId: string, channel: string, exp: number = 86400): string {
    const claims = {
      sub: String(userId),
      channel,
      exp: Math.floor(Date.now() / 1000) + exp,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtHelper.sign(claims, this.hmacSecret, { algorithm: 'HS256' });
  }

  /**
   * Publish message to a channel via HTTP API
   */
  async publish(channel: string, data: any): Promise<any> {
    const url = `${this.centrifugoUrl}/api/publish`;

    const payload = {
      channel,
      data,
    };

    return this.sendRequest(url, payload);
  }

  /**
   * Broadcast to multiple channels at once
   */
  async broadcast(channels: string[], data: any): Promise<any> {
    const url = `${this.centrifugoUrl}/api/broadcast`;

    const payload = {
      channels,
      data,
    };

    return this.sendRequest(url, payload);
  }

  /**
   * Send message to specific user
   */
  async sendToUser(userId: string, data: any): Promise<any> {
    const channel = `user:${userId}`;
    return this.publish(channel, data);
  }

  /**
   * Send message to a chat conversation
   */
  async sendToChatConversation(chatId: string, message: any): Promise<any> {
    const channel = `chat:${chatId}`;

    const data = {
      type: 'new_message',
      chat_id: chatId,
      message,
      timestamp: new Date().toISOString(),
    };

    return this.publish(channel, data);
  }

  /**
   * Send typing indicator to chat
   */
  async sendTypingIndicator(chatId: string, userId: string, isTyping: boolean = true): Promise<any> {
    const channel = `chat:${chatId}`;

    const data = {
      type: 'typing',
      chat_id: chatId,
      user_id: userId,
      is_typing: isTyping,
      timestamp: new Date().toISOString(),
    };

    return this.publish(channel, data);
  }

  /**
   * Broadcast message read event
   */
  async sendMessageReadEvent(messageId: string, conversationId: string, readerId: string): Promise<any> {
    const channel = `chat:${conversationId}`;

    const data = {
      type: 'message_read',
      message_id: messageId,
      conversation_id: conversationId,
      reader_id: readerId,
      read_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    return this.publish(channel, data);
  }

  /**
   * Broadcast conversation read event
   */
  async sendConversationReadEvent(
    conversationId: string,
    readerId: string,
    messageIds: string[] = [],
    updatedCount: number = 0,
  ): Promise<any> {
    const channel = `chat:${conversationId}`;

    const data = {
      type: 'conversation_read_notification',
      conversation_id: conversationId,
      reader_id: readerId,
      message_ids: messageIds,
      updated_count: updatedCount,
      timestamp: new Date().toISOString(),
    };

    return this.publish(channel, data);
  }

  /**
   * Get list of channels with active subscribers
   */
  async getChannels(): Promise<any> {
    const url = `${this.centrifugoUrl}/api/channels`;
    return this.sendRequest(url, {});
  }

  /**
   * Get information about specific channel
   */
  async getChannelInfo(channel: string): Promise<any> {
    const url = `${this.centrifugoUrl}/api/info`;

    const payload = {
      channel,
    };

    return this.sendRequest(url, payload);
  }

  /**
   * Disconnect user from Centrifugo
   */
  async disconnectUser(userId: string): Promise<any> {
    const url = `${this.centrifugoUrl}/api/disconnect`;

    const payload = {
      user: String(userId),
    };

    return this.sendRequest(url, payload);
  }

  /**
   * Test connection to Centrifugo server
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.centrifugoUrl}/api/info`;
      await this.sendRequest(url, {});
      return true;
    } catch (error) {
      console.error('Centrifugo connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Send HTTP request to Centrifugo API
   */
  private async sendRequest(url: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const postData = JSON.stringify(data);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apikey ${this.httpApiKey}`,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = client.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new BadRequestException(`Centrifugo API error: HTTP ${res.statusCode} - ${responseData}`));
            return;
          }

          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(new BadRequestException('Invalid response from Centrifugo'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new BadRequestException(`Failed to connect to Centrifugo: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Generate random ID for JWT jti claim
   */
  private generateRandomId(): string {
    return require('crypto').randomBytes(16).toString('hex');
  }
}
