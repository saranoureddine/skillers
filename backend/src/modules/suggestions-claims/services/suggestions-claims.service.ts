import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { SuggestionsClaimsEntity } from '../entities/suggestions-claims.entity';
import { SuggestionsClaimsRatingsEntity } from '../entities/suggestions-claims-ratings.entity';

/**
 * Shared service — common business logic for suggestions-claims
 */
@Injectable()
export class SuggestionsClaimsService {
  private readonly baseHost: string;
  private readonly TABLE_SUGGESTIONS = 235; // ag_attachment.table_name value

  constructor(
    @InjectRepository(SuggestionsClaimsEntity)
    private readonly suggestionsClaimsRepository: Repository<SuggestionsClaimsEntity>,
    @InjectRepository(SuggestionsClaimsRatingsEntity)
    private readonly ratingsRepository: Repository<SuggestionsClaimsRatingsEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
  }

  /**
   * Generate unique 20-character ID
   */
  generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Update suggestion's average rating and total count
   */
  async updateSuggestionRatings(suggestionId: string): Promise<void> {
    try {
      const ratings = await this.ratingsRepository.find({
        where: { suggestionClaimId: suggestionId },
      });

      const totalRatings = ratings.length;
      let averageRating = 0;

      if (totalRatings > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        averageRating = Math.round((sum / totalRatings) * 100) / 100; // Round to 2 decimal places
      }

      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id: suggestionId },
      });

      if (suggestion) {
        suggestion.averageRating = averageRating;
        suggestion.totalRatings = totalRatings;
        await this.suggestionsClaimsRepository.save(suggestion);
      }
    } catch (error) {
      console.error('Failed to update suggestion ratings:', error);
      // Don't throw - this is a background update
    }
  }

  /**
   * Get attachments for a suggestion/claim
   */
  async getAttachments(suggestionId: string): Promise<any[]> {
    try {
      const attachments = await this.dataSource.query(
        `
        SELECT 
          CASE 
            WHEN file_path LIKE 'http%' 
            THEN file_path 
            ELSE CONCAT(?, file_path) 
          END AS file_path
        FROM ag_attachment
        WHERE table_name = ? AND row_id = ?
        `,
        [this.baseHost, this.TABLE_SUGGESTIONS, suggestionId],
      );
      return attachments || [];
    } catch (error) {
      console.error('Failed to get attachments:', error);
      return [];
    }
  }

  /**
   * Get creator information (from users or ag_users)
   */
  async getCreatorInfo(createdBy: string | null, createdByAdmin: string | null): Promise<any> {
    if (createdByAdmin) {
      // Get admin user info from ag_users
      const adminUser = await this.dataSource.query(
        `
        SELECT 
          user_id, 
          first_name, 
          last_name, 
          country, 
          phone_number_one, 
          email_address
        FROM ag_users
        WHERE user_id = ?
        `,
        [createdByAdmin],
      );

      if (adminUser && adminUser.length > 0) {
        const admin = adminUser[0];
        return {
          id: admin.user_id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          type: 'admin',
          contact: (admin.country || '') + (admin.phone_number_one || ''),
          email: admin.email_address || null,
        };
      }
    } else if (createdBy) {
      // Get regular user info from users table
      const regularUser = await this.dataSource.query(
        `
        SELECT 
          id, 
          first_name, 
          last_name, 
          country_code, 
          phone_number, 
          email
        FROM users
        WHERE id = ?
        `,
        [createdBy],
      );

      if (regularUser && regularUser.length > 0) {
        const user = regularUser[0];
        const contact =
          user.phone_number === '00000000'
            ? user.email
            : (user.country_code || '') + (user.phone_number || '');
        return {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          type: 'user',
          contact,
          email: user.email || null,
        };
      }
    }
    return null;
  }

  /**
   * Send FCM notification (placeholder - TODO: implement actual FCM)
   */
  async sendFCMNotification(
    fcmToken: string,
    subject: string,
    body: string,
    additionalData?: any,
  ): Promise<void> {
    try {
      // TODO: Implement actual FCM notification sending
      // This should call a notification service similar to:
      // NotifController::SendMessage(fcmToken, subject, body, date, false, additionalData)
      console.log('SendFCMNotification called:', {
        fcmToken: fcmToken?.substring(0, 20) + '...',
        subject,
        body,
        additionalData,
      });
    } catch (error) {
      console.error('Failed to send FCM notification:', error);
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  /**
   * Create notification record in database
   */
  async createNotification(
    userId: string,
    subject: string,
    body: string,
    tableId: number,
    rowId: string,
    createdBy: string | null,
  ): Promise<string> {
    try {
      const notificationId = this.generateUniqueId();
      const now = new Date();

      await this.dataSource.query(
        `
        INSERT INTO notifications (
          id, user_id, subject, body, table_id, row_id, 
          is_seen, created_at, updated_at, created_by, updated_by, center_num
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 10)
        `,
        [notificationId, userId, subject, body, tableId, rowId, now, now, createdBy, createdBy],
      );

      // Create UserNotifications record
      const userNotifId = this.generateUniqueId();
      await this.dataSource.query(
        `
        INSERT INTO user_notifications (
          id, notification_id, user_id, is_seen
        ) VALUES (?, ?, ?, 0)
        `,
        [userNotifId, notificationId, userId],
      );

      return notificationId;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }
}
