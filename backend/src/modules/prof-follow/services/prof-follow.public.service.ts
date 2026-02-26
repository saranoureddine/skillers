import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProfFollowEntity } from '../entities/prof-follow.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfNotificationEntity, NotificationType } from '../../prof-notifications/entities/prof-notification.entity';
import { FollowUserDto } from '../dto/follow-user.dto';
import { UnfollowUserDto } from '../dto/unfollow-user.dto';
import { FollowBlockUserDto } from '../dto/block-user.dto';
import { FollowUnblockUserDto } from '../dto/unblock-user.dto';
import { MuteUserDto } from '../dto/mute-user.dto';
import { UnmuteUserDto } from '../dto/unmute-user.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';
import { GetFollowingDto } from '../dto/get-following.dto';
import { GetFollowStatusDto } from '../dto/get-follow-status.dto';
import { ProfFollowService } from './prof-follow.service';
import * as crypto from 'crypto';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfFollowPublicService {
  private readonly baseHost: string;
  private readonly STATUS_FOLLOWING = 'following';
  private readonly STATUS_BLOCKED = 'blocked';
  private readonly STATUS_MUTED = 'muted';

  constructor(
    @InjectRepository(ProfFollowEntity)
    private readonly followRepository: Repository<ProfFollowEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfNotificationEntity)
    private readonly notificationsRepository: Repository<ProfNotificationEntity>,
    private readonly dataSource: DataSource,
    private readonly followService: ProfFollowService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
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
   * Generate unique ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Send follow notification (creates notification and sends FCM)
   */
  private async sendFollowNotification(
    followerId: string,
    followingId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const debugInfo: any = {
      success: false,
      details: {},
      steps: [],
    };

    try {
      // Step 1: Get the follower's information
      const follower = await this.usersRepository.findOne({ where: { id: followerId } });
      if (!follower) {
        debugInfo.steps.push('Failed to find follower user');
        return debugInfo;
      }

      const followerName = `${follower.firstName} ${follower.lastName}`.trim();
      const displayName = followerName || follower.email || 'Someone';

      debugInfo.details.follower_name = displayName;
      debugInfo.steps.push(`Found follower: ${displayName}`);

      // Step 2: Get the followed user's FCM token
      const followedUser = await this.usersRepository.findOne({ where: { id: followingId } });
      if (!followedUser) {
        debugInfo.steps.push('Followed user not found');
        return debugInfo;
      }

      if (!followedUser.fcmToken) {
        debugInfo.steps.push('Followed user has no FCM token');
        debugInfo.success = true; // Not an error, just no FCM token
        return debugInfo;
      }

      debugInfo.details.followed_user_id = followingId;
      debugInfo.details.followed_fcm_token = followedUser.fcmToken.substring(0, 20) + '...';
      debugInfo.steps.push('Found followed user FCM token');

      // Step 3: Create notification message
      const title = 'New Follower'; // TODO: Use UtilsService.findString
      const message = `${displayName} started following you`; // TODO: Use UtilsService.findString

      debugInfo.details.notification_title = title;
      debugInfo.details.notification_message = message;
      debugInfo.steps.push('Created notification message');

      // Step 4: Create notification in database
      const notification = this.notificationsRepository.create({
        userId: followingId,
        type: NotificationType.FOLLOW,
        title,
        message,
        data: JSON.stringify({
          notification_id: null, // Will be set after save
          table_id: 257, // prof_follow table ID
          row_id: followerId,
          follower_id: followerId,
          follower_name: displayName,
          action: 'follow',
        }),
        isRead: 0,
      });

      const savedNotification = await this.notificationsRepository.save(notification);

      // Update data with notification ID
      const updatedData = JSON.parse(savedNotification.data || '{}');
      updatedData.notification_id = savedNotification.id;
      savedNotification.data = JSON.stringify(updatedData);
      await this.notificationsRepository.save(savedNotification);

      debugInfo.details.notification_id = savedNotification.id;
      debugInfo.steps.push(`Notification saved to database with ID: ${savedNotification.id}`);

      // Step 5: Send FCM notification (placeholder - implement actual FCM service)
      // TODO: Implement actual FCM sending using Firebase Admin SDK
      console.log('FCM notification would be sent:', {
        token: followedUser.fcmToken.substring(0, 20) + '...',
        title,
        message,
        data: updatedData,
      });

      debugInfo.details.fcm_result = { fcm_accepted: true, note: 'FCM sending not yet implemented' };
      debugInfo.steps.push('FCM notification sent (placeholder)');
      debugInfo.success = true;

      return debugInfo;
    } catch (error: any) {
      debugInfo.steps.push(`Exception occurred: ${error.message}`);
      debugInfo.details.error = error.message;
      console.error('Failed to send follow notification:', error);
      return debugInfo;
    }
  }

  /**
   * Follow a user
   */
  async followUser(
    dto: FollowUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      // Check if trying to follow self
      if (userId === followingId) {
        throw new BadRequestException('Cannot follow yourself');
      }

      // Check if target user exists
      const targetUser = await this.usersRepository.findOne({
        where: { id: followingId, isActivated: 1 },
      });
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      // Check if already following
      const existingFollow = await this.followService.findFollow(userId, followingId);
      if (existingFollow) {
        if (existingFollow.status === this.STATUS_FOLLOWING) {
          throw new ConflictException('Already following this user');
        } else {
          // Update existing relationship
          existingFollow.status = this.STATUS_FOLLOWING;
          existingFollow.followedAt = new Date();
          existingFollow.unfollowedAt = null;
          existingFollow.blockedAt = null;
          existingFollow.mutedAt = null;

          await queryRunner.manager.save(existingFollow);

          // Update counts
          await this.followService.updateFollowCounts(userId, followingId, 'follow');

          // Send notification
          const notificationResult = await this.sendFollowNotification(userId, followingId, languageCode);

          await queryRunner.commitTransaction();

          return {
            succeeded: true,
            message: 'User followed successfully',
            debug: {
              notification_sent: notificationResult.success || false,
              notification_details: notificationResult.details || null,
              follower_id: userId,
              following_id: followingId,
              action: 're-follow',
            },
          };
        }
      }

      // Create new follow relationship
      const follow = this.followRepository.create({
        followerId: userId,
        followingId: followingId,
        status: this.STATUS_FOLLOWING,
        followedAt: new Date(),
      });

      await queryRunner.manager.save(follow);

      // Update counts
      await this.followService.updateFollowCounts(userId, followingId, 'follow');

      // Send notification
      const notificationResult = await this.sendFollowNotification(userId, followingId, languageCode);

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'User followed successfully',
        debug: {
          notification_sent: notificationResult.success || false,
          notification_details: notificationResult.details || null,
          follower_id: userId,
          following_id: followingId,
          action: 'new-follow',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to follow user: ' + (error as Error).message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(
    dto: UnfollowUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      const follow = await this.followService.findFollow(userId, followingId);
      if (!follow) {
        throw new NotFoundException('Not following this user');
      }

      if (follow.status !== this.STATUS_FOLLOWING) {
        throw new BadRequestException('Not following this user');
      }

      // Delete the relationship completely
      await queryRunner.manager.remove(follow);

      // Update counts
      await this.followService.updateFollowCounts(userId, followingId, 'unfollow');

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'User unfollowed successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unfollow user: ' + (error as Error).message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Block a user
   */
  async blockUser(
    dto: FollowBlockUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      // Check if trying to block self
      if (userId === followingId) {
        throw new BadRequestException('Cannot block yourself');
      }

      const follow = await this.followService.findFollow(userId, followingId);
      const wasFollowing = follow && follow.status === this.STATUS_FOLLOWING;

      if (!follow) {
        const newFollow = this.followRepository.create({
          followerId: userId,
          followingId: followingId,
          status: this.STATUS_BLOCKED,
          blockedAt: new Date(),
        });
        await queryRunner.manager.save(newFollow);
      } else {
        follow.status = this.STATUS_BLOCKED;
        follow.blockedAt = new Date();
        follow.unfollowedAt = null;
        follow.mutedAt = null;
        await queryRunner.manager.save(follow);
      }

      // If they were following before blocking, decrement counts
      if (wasFollowing) {
        await this.followService.updateFollowCounts(userId, followingId, 'unfollow');
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'User blocked successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to block user: ' + (error as Error).message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(
    dto: FollowUnblockUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      const follow = await this.followService.findFollowByStatus(userId, followingId, this.STATUS_BLOCKED);
      if (!follow) {
        throw new NotFoundException('User not blocked');
      }

      // Delete the relationship completely
      await this.followRepository.remove(follow);

      return {
        succeeded: true,
        message: 'User unblocked successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unblock user: ' + (error as Error).message);
    }
  }

  /**
   * Mute a user
   */
  async muteUser(
    dto: MuteUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      // Check if trying to mute self
      if (userId === followingId) {
        throw new BadRequestException('Cannot mute yourself');
      }

      const follow = await this.followService.findFollow(userId, followingId);
      const wasFollowing = follow && follow.status === this.STATUS_FOLLOWING;

      if (!follow) {
        const newFollow = this.followRepository.create({
          followerId: userId,
          followingId: followingId,
          status: this.STATUS_MUTED,
          mutedAt: new Date(),
        });
        await queryRunner.manager.save(newFollow);
      } else {
        follow.status = this.STATUS_MUTED;
        follow.mutedAt = new Date();
        follow.unfollowedAt = null;
        follow.blockedAt = null;
        await queryRunner.manager.save(follow);
      }

      // If they weren't following before muting, increment counts (muting implies following)
      if (!wasFollowing) {
        await this.followService.updateFollowCounts(userId, followingId, 'follow');
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'User muted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mute user: ' + (error as Error).message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Unmute a user
   */
  async unmuteUser(
    dto: UnmuteUserDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const followingId = dto.following_id || dto.user_id;
      if (!followingId) {
        throw new BadRequestException('User ID is required');
      }

      const follow = await this.followService.findFollowByStatus(userId, followingId, this.STATUS_MUTED);
      if (!follow) {
        throw new NotFoundException('User not muted');
      }

      follow.status = this.STATUS_FOLLOWING;
      follow.followedAt = new Date();
      follow.mutedAt = null;

      await this.followRepository.save(follow);

      return {
        succeeded: true,
        message: 'User unmuted successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unmute user: ' + (error as Error).message);
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    dto: GetFollowersDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.user_id || currentUserId;
      const { page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Get the target user's followers count from users table
      const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
      const totalCount = targetUser ? targetUser.followersCount : 0;

      const followers = await this.dataSource.query(
        `SELECT 
          pf.id,
          pf.follower_id,
          pf.followed_at,
          u.first_name,
          u.last_name,
          u.email,
          u.bio,
          u.followers_count,
          u.following_count,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image,
          IF(pf2.id IS NOT NULL, 1, 0) as is_following_back
        FROM prof_follow pf
        LEFT JOIN users u ON u.id = pf.follower_id
        LEFT JOIN prof_follow pf2 ON pf2.follower_id = ? AND pf2.following_id = pf.follower_id AND pf2.status = 'following'
        WHERE pf.following_id = ? AND pf.status = 'following'
        ORDER BY pf.followed_at DESC
        LIMIT ? OFFSET ?`,
        [this.baseHost, currentUserId, targetUserId, limit, offset]
      );

      return {
        succeeded: true,
        followers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get followers: ' + (error as Error).message);
    }
  }

  /**
   * Get users that the user is following
   */
  async getFollowing(
    dto: GetFollowingDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.user_id || currentUserId;
      const { page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Get the target user's following count from users table
      const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
      const totalCount = targetUser ? targetUser.followingCount : 0;

      const following = await this.dataSource.query(
        `SELECT 
          pf.id,
          pf.following_id,
          pf.followed_at,
          u.first_name,
          u.last_name,
          u.email,
          u.bio,
          u.followers_count,
          u.following_count,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image,
          IF(pf2.id IS NOT NULL, 1, 0) as is_following_back
        FROM prof_follow pf
        LEFT JOIN users u ON u.id = pf.following_id
        LEFT JOIN prof_follow pf2 ON pf2.follower_id = ? AND pf2.following_id = pf.following_id AND pf2.status = 'following'
        WHERE pf.follower_id = ? AND pf.status = 'following'
        ORDER BY pf.followed_at DESC
        LIMIT ? OFFSET ?`,
        [this.baseHost, currentUserId, targetUserId, limit, offset]
      );

      return {
        succeeded: true,
        following,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get following: ' + (error as Error).message);
    }
  }

  /**
   * Check follow status between users
   */
  async getFollowStatus(
    dto: GetFollowStatusDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.target_user_id || dto.user_id;
      if (!targetUserId) {
        throw new BadRequestException('Target user ID is required');
      }

      // Get follow relationships
      const following = await this.followService.findFollow(currentUserId, targetUserId);
      const followedBy = await this.followService.findFollow(targetUserId, currentUserId);

      return {
        succeeded: true,
        status: {
          is_following: following ? following.status : null,
          is_followed_by: followedBy ? followedBy.status : null,
          is_mutual:
            following &&
            following.status === this.STATUS_FOLLOWING &&
            followedBy &&
            followedBy.status === this.STATUS_FOLLOWING,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get follow status: ' + (error as Error).message);
    }
  }
}
