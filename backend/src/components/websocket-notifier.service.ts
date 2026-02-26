import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as https from 'https';
import * as http from 'http';

/**
 * WebSocket Notifier Service
 * Sends real-time notifications to all authenticated users via WebSocket
 */
@Injectable()
export class WebSocketNotifierService {
  private readonly logger = new Logger(WebSocketNotifierService.name);
  private readonly websocketServerUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.websocketServerUrl = this.configService.get<string>('WEBSOCKET_SERVER_URL') || 'https://chat.brain-space.app';
  }

  /**
   * Send WebSocket notification to all authenticated users
   */
  async send(
    action: 'create' | 'update' | 'delete',
    tableName: string,
    recordId: number,
    userId: string,
    additionalData: any = {},
    viewName?: string,
  ): Promise<boolean> {
    try {
      // Get all authenticated online users
      const userIds = await this.getAllAuthenticatedUsers();

      if (userIds.length === 0) {
        this.logger.warn('No authenticated users online to notify');
        return false;
      }

      // Get user name
      const userName = await this.getUserName(userId);

      // For delete operations, record is already deleted - don't fetch
      let recordData: any = {};
      if (action !== 'delete') {
        recordData = await this.fetchRecordData(tableName, recordId);
        if (!recordData) {
          this.logger.warn(`Record not found: ${tableName}#${recordId}`);
          return false;
        }
      }

      // Build action message
      const actionMessage = this.buildActionMessage(action, tableName, recordId, userName);

      // Prepare notification payload
      const realTimeData: any = {
        type: 'user',
        userIds,
        notification: {
          action,
          table_name: tableName,
          record_id: recordId,
          user_id: userId,
          user_name: userName,
          timestamp: new Date().toISOString(),
          message: actionMessage,
          data: { ...recordData, ...additionalData },
        },
      };

      // Add view_name if provided
      if (viewName) {
        realTimeData.notification.view_name = viewName;
      }

      // Send the notification
      return await this.sendToWebSocketServer(realTimeData);
    } catch (error) {
      this.logger.error(`WebSocketNotifier Error: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get all authenticated users who are currently online
   */
  private async getAllAuthenticatedUsers(): Promise<string[]> {
    try {
      const users = await this.dataSource.query(
        `
        SELECT id
        FROM users
        WHERE is_activated = 1
        `,
      );

      return users.map((u: any) => String(u.id));
    } catch (error) {
      this.logger.error(`Error fetching authenticated users: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch fresh record data from database
   * TODO: Implement full logic matching Yii GeneralController::getAllFieldsForFiltering
   */
  private async fetchRecordData(tableName: string, recordId: number): Promise<any> {
    try {
      // Simplified version - in production, implement full field fetching with joins
      const record = await this.dataSource.query(
        `
        SELECT *
        FROM ?? 
        WHERE id = ?
        LIMIT 1
        `,
        [tableName, recordId],
      );

      return record && record.length > 0 ? record[0] : null;
    } catch (error) {
      this.logger.error(`Error fetching record data: ${error.message}`);
      return null;
    }
  }

  /**
   * Get user name by ID
   */
  private async getUserName(userId: string): Promise<string> {
    try {
      const user = await this.dataSource.query(
        `
        SELECT first_name, last_name
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId],
      );

      if (user && user.length > 0) {
        return `${user[0].first_name || ''} ${user[0].last_name || ''}`.trim() || 'Unknown User';
      }

      return 'Unknown User';
    } catch (error) {
      return 'Unknown User';
    }
  }

  /**
   * Build action message
   */
  private buildActionMessage(action: string, tableName: string, recordId: number, userName: string): string {
    const tableDisplayName = tableName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    switch (action) {
      case 'create':
        return `${userName} created a new ${tableDisplayName} #${recordId}`;
      case 'update':
        return `${userName} updated ${tableDisplayName} #${recordId}`;
      case 'delete':
        return `${userName} deleted ${tableDisplayName} #${recordId}`;
      default:
        return `${userName} performed ${action} on ${tableDisplayName} #${recordId}`;
    }
  }

  /**
   * Send notification to WebSocket server via HTTP API
   */
  private async sendToWebSocketServer(payload: any): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const url = new URL(`${this.websocketServerUrl}/api/notify`);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const postData = JSON.stringify(payload);

        const refererOptions = [
          'https://localhost:3000',
          'https://chat.brain-space.app',
          'https://brain-space.app',
          'https://localhost:8080',
        ];

        const options = {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'BrainSpace-Backend/1.0',
            'Referer': refererOptions[0],
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 5000,
        };

        // For development only - disable SSL verification
        if (isHttps) {
          (options as any).rejectUnauthorized = false;
        }

        const req = client.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 200) {
              this.logger.log('✅ WebSocket notification sent successfully');
              resolve(true);
            } else {
              this.logger.error(`❌ WebSocket notification failed: HTTP ${res.statusCode} - ${data}`);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          this.logger.error(`❌ Error sending to WebSocket server: ${error.message}`);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          this.logger.error('❌ WebSocket notification timeout');
          resolve(false);
        });

        req.write(postData);
        req.end();
      } catch (error) {
        this.logger.error(`❌ Error sending to WebSocket server: ${error.message}`);
        resolve(false);
      }
    });
  }
}
