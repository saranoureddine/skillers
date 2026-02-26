import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { ProfNotificationEntity, NotificationType } from '../entities/prof-notification.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfPostEntity } from '../../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../../prof-posts/entities/prof-comment.entity';
import {
  GetNotificationsDto,
  MarkAsReadDto,
  DeleteNotificationDto,
  GetNotificationsByTypeDto,
  UpdateNotificationPreferencesDto,
} from '../dto';

/**
 * Public ProfNotifications Service — handles all business logic for professional notifications
 * Matches Yii ProfNotificationsController implementation exactly
 */
@Injectable()
export class ProfNotificationsPublicService {
  constructor(
    @InjectRepository(ProfNotificationEntity)
    private readonly profNotificationsRepository: Repository<ProfNotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(ProfCommentEntity)
    private readonly profCommentsRepository: Repository<ProfCommentEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate unique notification ID (format: {number}-{hex})
   * Matches Yii notification ID format like "10258-1a27"
   */
  private generateNotificationId(): string {
    // Generate a number (could be timestamp-based or sequential)
    const number = Math.floor(Math.random() * 99999) + 10000; // 5-digit number
    // Generate 4-character hex string
    const hex = crypto.randomBytes(2).toString('hex');
    return `${number}-${hex}`;
  }

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Get user's notifications and automatically mark them as read (Instagram-style)
   * Matches Yii actionGetNotifications() exactly
   */
  async getNotifications(
    userId: string,
    dto: GetNotificationsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get notifications
      const query = this.profNotificationsRepository
        .createQueryBuilder('n')
        .where('n.user_id = :userId', { userId })
        .orderBy('n.created_at', 'DESC');

      const totalCount = await query.getCount();
      const notifications = await query
        .offset(offset)
        .limit(limit)
        .getMany();

      // ✅ INSTAGRAM-STYLE: Automatically mark all notifications as read when viewed
      // This happens AFTER getting the notifications but BEFORE returning them
      const markedAsRead = await this.profNotificationsRepository.update(
        { userId, isRead: 0 },
        { isRead: 1, readAt: new Date() },
      );

      // Transform to match Yii response format
      const notificationsArray = notifications.map((n) => ({
        id: n.id,
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data ? JSON.parse(n.data) : null,
        is_read: n.isRead,
        read_at: n.readAt,
        created_at: n.createdAt,
      }));

      return {
        succeeded: true,
        notifications: notificationsArray,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount),
          pages: Math.ceil(totalCount / limit),
        },
        marked_as_read: markedAsRead.affected || 0,
        unread_count: 0, // Since we just marked all as read
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get notifications: ' + error.message);
    }
  }

  /**
   * Get unread notifications count
   * Matches Yii actionGetUnreadCount() exactly
   */
  async getUnreadCount(userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const unreadCount = await this.profNotificationsRepository.count({
        where: { userId, isRead: 0 },
      });

      return {
        succeeded: true,
        unread_count: Number(unreadCount),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get unread count: ' + error.message);
    }
  }

  /**
   * Mark notification as read
   * Matches Yii actionMarkAsRead() exactly
   */
  async markAsRead(
    userId: string,
    dto: MarkAsReadDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.notification_id) {
        throw new BadRequestException('Notification ID is required');
      }

      const notification = await this.profNotificationsRepository.findOne({
        where: { id: dto.notification_id },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // Check if user owns this notification
      if (notification.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      notification.isRead = 1;
      notification.readAt = new Date();

      await this.profNotificationsRepository.save(notification);

      return {
        succeeded: true,
        message: 'Notification marked as read', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark notification as read: ' + error.message);
    }
  }

  /**
   * Mark all notifications as read
   * Matches Yii actionMarkAllAsRead() exactly
   */
  async markAllAsRead(userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const updated = await this.profNotificationsRepository.update(
        { userId, isRead: 0 },
        { isRead: 1, readAt: new Date() },
      );

      return {
        succeeded: true,
        message: 'All notifications marked as read', // TODO: Use UtilsService.findString
        updated_count: updated.affected || 0,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark all notifications as read: ' + error.message);
    }
  }

  /**
   * Delete a notification
   * Matches Yii actionDeleteNotification() exactly
   */
  async deleteNotification(
    userId: string,
    dto: DeleteNotificationDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.notification_id) {
        throw new BadRequestException('Notification ID is required');
      }

      const notification = await this.profNotificationsRepository.findOne({
        where: { id: dto.notification_id },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // Check if user owns this notification
      if (notification.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      await this.profNotificationsRepository.remove(notification);

      return {
        succeeded: true,
        message: 'Notification deleted successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete notification: ' + error.message);
    }
  }

  /**
   * Clear all notifications
   * Matches Yii actionClearAllNotifications() exactly
   */
  async clearAllNotifications(userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const deleted = await this.profNotificationsRepository.delete({ userId });

      return {
        succeeded: true,
        message: 'All notifications cleared', // TODO: Use UtilsService.findString
        deleted_count: deleted.affected || 0,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to clear all notifications: ' + error.message);
    }
  }

  /**
   * Get notifications by type
   * Matches Yii actionGetNotificationsByType() exactly
   */
  async getNotificationsByType(
    userId: string,
    dto: GetNotificationsByTypeDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.type) {
        throw new BadRequestException('Type is required');
      }

      const validTypes = Object.values(NotificationType);
      if (!validTypes.includes(dto.type)) {
        throw new BadRequestException('Invalid notification type');
      }

      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.profNotificationsRepository
        .createQueryBuilder('n')
        .where('n.user_id = :userId', { userId })
        .andWhere('n.type = :type', { type: dto.type })
        .orderBy('n.created_at', 'DESC');

      const totalCount = await query.getCount();
      const notifications = await query.offset(offset).limit(limit).getMany();

      // Transform to match Yii response format
      const notificationsArray = notifications.map((n) => ({
        id: n.id,
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data ? JSON.parse(n.data) : null,
        is_read: n.isRead,
        read_at: n.readAt,
        created_at: n.createdAt,
      }));

      return {
        succeeded: true,
        notifications: notificationsArray,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount),
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get notifications by type: ' + error.message);
    }
  }

  /**
   * Get user's notification preferences
   * Matches Yii actionGetNotificationPreferences() exactly
   */
  async getNotificationPreferences(userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        succeeded: true,
        preferences: {
          receive_notifications: Boolean(user.receiveNotifications ?? 1),
          receive_calls: Boolean(user.receiveCalls ?? 0),
          receive_offers: Boolean(user.receiveOffers ?? 0),
          receive_updates: Boolean(user.receiveUpdates ?? 0),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get notification preferences: ' + error.message);
    }
  }

  /**
   * Update user's notification preferences
   * Matches Yii actionUpdateNotificationPreferences() exactly
   */
  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update preferences if provided
      if (dto.receive_notifications !== undefined) {
        user.receiveNotifications = dto.receive_notifications;
      }
      if (dto.receive_calls !== undefined) {
        user.receiveCalls = dto.receive_calls;
      }
      if (dto.receive_offers !== undefined) {
        user.receiveOffers = dto.receive_offers;
      }
      if (dto.receive_updates !== undefined) {
        user.receiveUpdates = dto.receive_updates;
      }

      await this.usersRepository.save(user);

      return {
        succeeded: true,
        message: 'Notification preferences updated successfully', // TODO: Use UtilsService.findString
        preferences: {
          receive_notifications: Boolean(user.receiveNotifications),
          receive_calls: Boolean(user.receiveCalls),
          receive_offers: Boolean(user.receiveOffers),
          receive_updates: Boolean(user.receiveUpdates),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update notification preferences: ' + error.message);
    }
  }

  /**
   * Create a notification (internal method)
   * Matches Yii createNotification() static method exactly
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: any = null,
  ): Promise<boolean> {
    try {
      // ✅ Check if user has disabled receiving notifications
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (user && user.receiveNotifications === 0) {
        // Log that notification was skipped (in production, use proper logger)
        console.log(`User ${userId} has disabled receive_notifications, skipping notification`);
        return false;
      }

      const notification = this.profNotificationsRepository.create({
        id: this.generateNotificationId(),
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        isRead: 0,
        createdAt: new Date(),
      } as Partial<ProfNotificationEntity>);

      await this.profNotificationsRepository.save(notification);
      return true;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return false;
    }
  }

  /**
   * Create notification for post like
   * Matches Yii createPostLikeNotification() static method exactly
   */
  async createPostLikeNotification(postId: number, likerId: string): Promise<boolean> {
    try {
      // Get post owner
      const post = await this.profPostsRepository.findOne({
        where: { id: postId },
      });

      if (!post || post.userId === likerId) {
        return false; // Don't notify self
      }

      // Get liker info
      const liker = await this.usersRepository.findOne({
        where: { id: likerId },
      });

      if (!liker) {
        return false;
      }

      const title = 'New Like';
      const message = `${liker.firstName} ${liker.lastName} liked your post`;
      const data = {
        post_id: postId,
        liker_id: likerId,
        liker_name: `${liker.firstName} ${liker.lastName}`,
      };

      return await this.createNotification(post.userId, NotificationType.LIKE, title, message, data);
    } catch (error) {
      console.error('Failed to create post like notification:', error);
      return false;
    }
  }

  /**
   * Create notification for comment
   * Matches Yii createCommentNotification() static method exactly
   */
  async createCommentNotification(
    postId: number,
    commenterId: string,
    commentId: number,
  ): Promise<boolean> {
    try {
      // Get post owner
      const post = await this.profPostsRepository.findOne({
        where: { id: postId },
      });

      if (!post || post.userId === commenterId) {
        return false; // Don't notify self
      }

      // Get commenter info
      const commenter = await this.usersRepository.findOne({
        where: { id: commenterId },
      });

      if (!commenter) {
        return false;
      }

      const title = 'New Comment';
      const message = `${commenter.firstName} ${commenter.lastName} commented on your post`;
      const data = {
        post_id: postId,
        comment_id: commentId,
        commenter_id: commenterId,
        commenter_name: `${commenter.firstName} ${commenter.lastName}`,
      };

      return await this.createNotification(
        post.userId,
        NotificationType.COMMENT,
        title,
        message,
        data,
      );
    } catch (error) {
      console.error('Failed to create comment notification:', error);
      return false;
    }
  }

  /**
   * Create notification for follow
   * Matches Yii createFollowNotification() static method exactly
   */
  async createFollowNotification(followedUserId: string, followerId: string): Promise<boolean> {
    try {
      if (followedUserId === followerId) {
        return false; // Don't notify self
      }

      // Get follower info
      const follower = await this.usersRepository.findOne({
        where: { id: followerId },
      });

      if (!follower) {
        return false;
      }

      const title = 'New Follower';
      const message = `${follower.firstName} ${follower.lastName} started following you`;
      const data = {
        follower_id: followerId,
        follower_name: `${follower.firstName} ${follower.lastName}`,
      };

      return await this.createNotification(
        followedUserId,
        NotificationType.FOLLOW,
        title,
        message,
        data,
      );
    } catch (error) {
      console.error('Failed to create follow notification:', error);
      return false;
    }
  }

  /**
   * Create notification for comment reply
   * Matches Yii createCommentReplyNotification() static method exactly
   */
  async createCommentReplyNotification(
    commentId: number,
    replierId: string,
    replyId: number,
  ): Promise<boolean> {
    try {
      // Get original comment
      const comment = await this.profCommentsRepository.findOne({
        where: { id: commentId },
      });

      if (!comment || comment.userId === replierId) {
        return false; // Don't notify self
      }

      // Get replier info
      const replier = await this.usersRepository.findOne({
        where: { id: replierId },
      });

      if (!replier) {
        return false;
      }

      const title = 'New Reply';
      const message = `${replier.firstName} ${replier.lastName} replied to your comment`;
      const data = {
        comment_id: commentId,
        reply_id: replyId,
        replier_id: replierId,
        replier_name: `${replier.firstName} ${replier.lastName}`,
      };

      return await this.createNotification(
        comment.userId,
        NotificationType.COMMENT_REPLY,
        title,
        message,
        data,
      );
    } catch (error) {
      console.error('Failed to create comment reply notification:', error);
      return false;
    }
  }
}
