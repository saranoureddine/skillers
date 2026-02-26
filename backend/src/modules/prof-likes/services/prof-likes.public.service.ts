import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProfLikeEntity } from '../entities/prof-like.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfPostEntity } from '../../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../../prof-posts/entities/prof-comment.entity';
import { LikeDto } from '../dto/like.dto';
import { GetLikesDto } from '../dto/get-likes.dto';
import { GetUserLikesDto } from '../dto/get-user-likes.dto';
import { ProfLikesService } from './prof-likes.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfLikesPublicService {
  private readonly baseHost: string;
  private readonly PROF_POSTS_TABLE = 253;
  private readonly PROF_COMMENTS_TABLE = 255;

  constructor(
    @InjectRepository(ProfLikeEntity)
    private readonly likesRepository: Repository<ProfLikeEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfPostEntity)
    private readonly postsRepository: Repository<ProfPostEntity>,
    @InjectRepository(ProfCommentEntity)
    private readonly commentsRepository: Repository<ProfCommentEntity>,
    private readonly dataSource: DataSource,
    private readonly likesService: ProfLikesService,
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
   * Validate access to likeable item
   */
  private async validateLikeableAccess(
    likeableType: string,
    likeableId: number,
    userId: string,
  ): Promise<void> {
    if (likeableType === 'post') {
      const post = await this.postsRepository.findOne({
        where: { id: likeableId, isDeleted: 0 },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if post is public or user owns it
      if (post.isPublic === 0 && post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (likeableType === 'comment') {
      const comment = await this.commentsRepository.findOne({
        where: { id: likeableId, isDeleted: 0 },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if comment's post is accessible
      const post = await this.postsRepository.findOne({
        where: { id: comment.postId, isDeleted: 0 },
      });

      if (!post || (post.isPublic === 0 && post.userId !== userId)) {
        throw new ForbiddenException('Access denied');
      }
    }
  }

  /**
   * Build image URL
   */
  private buildImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${this.baseHost}/${imagePath.replace(/^\/+/, '')}`;
  }

  /**
   * Like a post or comment
   */
  async like(dto: LikeDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { likeableType, likeableId } = dto;

      // Validate likeable type
      if (!['post', 'comment'].includes(likeableType)) {
        throw new BadRequestException('Invalid likeable type');
      }

      // Validate access
      await this.validateLikeableAccess(likeableType, likeableId, userId);

      // Check if already liked
      const existingLike = await this.likesService.findByUserAndLikeable(userId, likeableType, likeableId);
      if (existingLike) {
        throw new ConflictException('Already liked');
      }

      // Create new like
      const like = this.likesRepository.create({
        userId,
        likeableType,
        likeableId,
      });

      const saved = await this.likesRepository.save(like);

      // Update likes count
      if (likeableType === 'post') {
        await this.dataSource.query('UPDATE prof_posts SET likes_count = likes_count + 1 WHERE id = ?', [likeableId]);
      } else if (likeableType === 'comment') {
        await this.dataSource.query('UPDATE prof_comments SET likes_count = likes_count + 1 WHERE id = ?', [likeableId]);
      }

      // TODO: Send notification
      const notificationResult = { success: false, message: 'Not implemented' };

      return {
        succeeded: true,
        message: 'Liked successfully',
        debug: {
          notification_sent: notificationResult.success,
          notification_details: notificationResult.message,
          like_id: saved.id,
          likeable_type: likeableType,
          likeable_id: likeableId,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to like');
    }
  }

  /**
   * Unlike a post or comment
   */
  async unlike(dto: LikeDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { likeableType, likeableId } = dto;

      // Validate likeable type
      if (!['post', 'comment'].includes(likeableType)) {
        throw new BadRequestException('Invalid likeable type');
      }

      // Find existing like
      const like = await this.likesService.findByUserAndLikeable(userId, likeableType, likeableId);
      if (!like) {
        throw new NotFoundException('Not liked');
      }

      // Delete like
      await this.likesRepository.remove(like);

      // Update likes count
      if (likeableType === 'post') {
        await this.dataSource.query('UPDATE prof_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [likeableId]);
      } else if (likeableType === 'comment') {
        await this.dataSource.query('UPDATE prof_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [likeableId]);
      }

      return {
        succeeded: true,
        message: 'Unliked successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unlike');
    }
  }

  /**
   * Toggle like (like if not liked, unlike if liked)
   */
  async toggleLike(dto: LikeDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { likeableType, likeableId } = dto;

      // Validate likeable type
      if (!['post', 'comment'].includes(likeableType)) {
        throw new BadRequestException('Invalid likeable type');
      }

      // Validate access
      await this.validateLikeableAccess(likeableType, likeableId, userId);

      // Check if already liked
      const existingLike = await this.likesService.findByUserAndLikeable(userId, likeableType, likeableId);

      if (existingLike) {
        // Unlike
        await this.likesRepository.remove(existingLike);

        // Update likes count
        if (likeableType === 'post') {
          await this.dataSource.query('UPDATE prof_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [likeableId]);
        } else if (likeableType === 'comment') {
          await this.dataSource.query('UPDATE prof_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [likeableId]);
        }

        return {
          succeeded: true,
          message: 'Unliked successfully',
          is_liked: false,
        };
      } else {
        // Like
        const like = this.likesRepository.create({
          userId,
          likeableType,
          likeableId,
        });

        const saved = await this.likesRepository.save(like);

        // Update likes count
        if (likeableType === 'post') {
          await this.dataSource.query('UPDATE prof_posts SET likes_count = likes_count + 1 WHERE id = ?', [likeableId]);
        } else if (likeableType === 'comment') {
          await this.dataSource.query('UPDATE prof_comments SET likes_count = likes_count + 1 WHERE id = ?', [likeableId]);
        }

        // TODO: Send notification
        const notificationResult = { success: false, message: 'Not implemented' };

        return {
          succeeded: true,
          message: 'Liked successfully',
          is_liked: true,
          debug: {
            notification_sent: notificationResult.success,
            notification_details: notificationResult.message,
            like_id: saved.id,
            likeable_type: likeableType,
            likeable_id: likeableId,
          },
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to toggle like');
    }
  }

  /**
   * Get likes for a post or comment
   */
  async getLikes(dto: GetLikesDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { likeableType, likeableId, page = 1, limit = 20 } = dto;

      // Validate likeable type
      if (!['post', 'comment'].includes(likeableType)) {
        throw new BadRequestException('Invalid likeable type');
      }

      // Validate access
      await this.validateLikeableAccess(likeableType, likeableId, userId);

      const offset = (page - 1) * limit;

      // Get likes with user info
      const likes = await this.dataSource.query(
        `SELECT 
          pl.id,
          pl.created_at,
          u.first_name,
          u.last_name,
          u.email,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image
        FROM prof_likes pl
        LEFT JOIN users u ON u.id = pl.user_id
        WHERE pl.likeable_type = ? AND pl.likeable_id = ?
        ORDER BY pl.created_at DESC
        LIMIT ? OFFSET ?`,
        [this.baseHost, likeableType, likeableId, limit, offset]
      );

      // Get total count
      const totalResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_likes WHERE likeable_type = ? AND likeable_id = ?',
        [likeableType, likeableId]
      );
      const totalCount = totalResult[0]?.count || 0;

      return {
        succeeded: true,
        likes,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get likes');
    }
  }

  /**
   * Get user's likes
   */
  async getUserLikes(dto: GetUserLikesDto, currentUserId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { userId: targetUserId = currentUserId, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Get likes with user and content info
      const likes = await this.dataSource.query(
        `SELECT 
          pl.id,
          pl.likeable_type,
          pl.likeable_id,
          pl.created_at,
          u.first_name,
          u.last_name,
          u.email,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image,
          CASE WHEN pl.likeable_type = 'post' THEN pp.content ELSE NULL END AS post_content,
          CASE WHEN pl.likeable_type = 'comment' THEN pc.content ELSE NULL END AS comment_content
        FROM prof_likes pl
        LEFT JOIN users u ON u.id = pl.user_id
        LEFT JOIN prof_posts pp ON pp.id = pl.likeable_id AND pl.likeable_type = 'post'
        LEFT JOIN prof_comments pc ON pc.id = pl.likeable_id AND pl.likeable_type = 'comment'
        WHERE pl.user_id = ?
        ORDER BY pl.created_at DESC
        LIMIT ? OFFSET ?`,
        [this.baseHost, targetUserId, limit, offset]
      );

      // Get total count
      const totalResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_likes WHERE user_id = ?',
        [targetUserId]
      );
      const totalCount = totalResult[0]?.count || 0;

      return {
        succeeded: true,
        likes,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user likes');
    }
  }

  /**
   * Check if user has liked a specific item
   */
  async checkLike(dto: LikeDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const { likeableType, likeableId } = dto;

      // Validate likeable type
      if (!['post', 'comment'].includes(likeableType)) {
        throw new BadRequestException('Invalid likeable type');
      }

      const isLiked = await this.likesService.isLiked(userId, likeableType, likeableId);

      return {
        succeeded: true,
        is_liked: isLiked,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to check like');
    }
  }
}
