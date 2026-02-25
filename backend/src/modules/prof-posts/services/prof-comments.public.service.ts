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
import { ProfCommentEntity } from '../entities/prof-comment.entity';
import { ProfPostEntity } from '../entities/prof-post.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  GetPostCommentsDto,
  GetCommentRepliesDto,
  GetUserCommentsDto,
} from '../dto';

/**
 * Public ProfComments Service — handles all business logic for professional comments
 */
@Injectable()
export class ProfCommentsPublicService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(ProfCommentEntity)
    private readonly profCommentsRepository: Repository<ProfCommentEntity>,
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('app.baseHost', 'http://localhost/');
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
   * Convert file path to public URL
   */
  private toPublicUrl(filePath: string | null): string | null {
    if (!filePath) {
      return null;
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const path = `/${filePath.replace(/^\/+/, '')}`;
    return `${this.baseHost.replace(/\/+$/, '')}${path}`;
  }

  /**
   * Create a new comment (actionCreateComment)
   * Matches Yii implementation exactly
   */
  async createComment(
    userId: string,
    dto: CreateCommentDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Check if post exists and is accessible
      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id, isDeleted: 0 },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if post is public or user owns it
      if (post.isPublic === 0 && post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // If this is a reply, check if parent comment exists
      if (dto.parent_id) {
        const parentComment = await this.profCommentsRepository.findOne({
          where: { id: dto.parent_id, postId: dto.post_id, isDeleted: 0 },
        });

        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }

      const comment = this.profCommentsRepository.create({
        postId: dto.post_id,
        userId: userId,
        parentId: dto.parent_id || null,
        content: dto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<ProfCommentEntity>);

      await this.profCommentsRepository.save(comment);

      // Update comments count in the related post
      await this.profPostsRepository.increment({ id: dto.post_id }, 'commentsCount', 1);

      // If this is a reply, update replies count in the parent comment
      if (dto.parent_id) {
        await this.profCommentsRepository.increment({ id: dto.parent_id }, 'repliesCount', 1);
      }

      // TODO: Send notification to the post owner and parent comment owner (if it's a reply)
      // This requires Notifications entity and NotifController conversion

      return {
        succeeded: true,
        message: 'Comment created successfully', // TODO: Use UtilsService.findString
        comment_id: comment.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create comment: ' + error.message);
    }
  }

  /**
   * Get comments for a post (actionGetPostComments)
   * Matches Yii implementation exactly
   */
  async getPostComments(
    userId: string,
    dto: GetPostCommentsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Check if post exists and is accessible
      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id, isDeleted: 0 },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if post is public or user owns it
      if (post.isPublic === 0 && post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Get current user profile
      const currentUser = await this.dataSource
        .createQueryBuilder()
        .select([
          'u.id AS id',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          'u.phone_number AS phone_number',
          'u.user_work AS user_work',
          'u.bio AS bio',
          'u.average_rating AS average_rating',
          'u.total_ratings AS total_ratings',
          'u.is_public_profile AS is_public_profile',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS main_image`,
        ])
        .from(UserEntity, 'u')
        .where('u.id = :userId', { userId })
        .getRawOne();

      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pc.id AS id',
          'pc.content AS content',
          'pc.parent_id AS parent_id',
          'pc.likes_count AS likes_count',
          'pc.replies_count AS replies_count',
          'pc.is_edited AS is_edited',
          "CONVERT_TZ(pc.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pc.updated_at, '+00:00', '+03:00') AS updated_at",
          'pc.user_id AS user_id',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          'u.phone_number AS phone_number',
          'u.user_work AS user_work',
          'u.bio AS bio',
          'u.average_rating AS average_rating',
          'u.total_ratings AS total_ratings',
          'u.is_public_profile AS is_public_profile',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfCommentEntity, 'pc')
        .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
        .where('pc.post_id = :postId', { postId: dto.post_id })
        .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pc.parent_id IS NULL');

      const totalCount = await query.getCount();
      const comments = await query
        .orderBy('pc.created_at', 'ASC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get replies recursively for each comment
      for (const comment of comments) {
        comment.replies = await this.getCommentRepliesRecursive(comment.id, dto.post_id, userId);
        comment.has_replies = comment.replies.length > 0;
        comment.replies_count = await this.getHierarchicalReplyCount(comment.id, dto.post_id);
      }

      return {
        succeeded: true,
        current_user: currentUser,
        comments: comments,
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
      throw new InternalServerErrorException('Failed to get post comments: ' + error.message);
    }
  }

  /**
   * Update a comment (actionUpdateComment)
   * Matches Yii implementation exactly
   */
  async updateComment(
    userId: string,
    dto: UpdateCommentDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const comment = await this.profCommentsRepository.findOne({
        where: { id: dto.comment_id },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user owns this comment
      if (comment.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      comment.content = dto.content;
      comment.isEdited = 1;
      comment.updatedAt = new Date();

      await this.profCommentsRepository.save(comment);

      return {
        succeeded: true,
        message: 'Comment updated successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update comment: ' + error.message);
    }
  }

  /**
   * Delete a comment (soft delete) (actionDeleteComment)
   * Matches Yii implementation exactly
   */
  async deleteComment(
    userId: string,
    dto: DeleteCommentDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const comment = await this.profCommentsRepository.findOne({
        where: { id: dto.comment_id },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user owns this comment
      if (comment.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Soft delete
      comment.isDeleted = 1;
      comment.deletedAt = new Date();
      comment.deletedBy = userId;
      comment.updatedAt = new Date();

      await this.profCommentsRepository.save(comment);

      // Update comments count in the related post
      await this.profPostsRepository.decrement({ id: comment.postId }, 'commentsCount', 1);

      // If this is a reply, update replies count in the parent comment
      if (comment.parentId) {
        await this.profCommentsRepository.decrement({ id: comment.parentId }, 'repliesCount', 1);
      }

      return {
        succeeded: true,
        message: 'Comment deleted successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete comment: ' + error.message);
    }
  }

  /**
   * Get comment replies (actionGetCommentReplies)
   * Matches Yii implementation exactly
   */
  async getCommentReplies(
    userId: string,
    dto: GetCommentRepliesDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Check if parent comment exists
      const parentComment = await this.profCommentsRepository.findOne({
        where: { id: dto.comment_id, isDeleted: 0 },
      });

      if (!parentComment) {
        throw new NotFoundException('Comment not found');
      }

      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pc.id AS id',
          'pc.content AS content',
          'pc.parent_id AS parent_id',
          'pc.user_id AS user_id',
          'pc.likes_count AS likes_count',
          'pc.replies_count AS replies_count',
          'pc.is_edited AS is_edited',
          "CONVERT_TZ(pc.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pc.updated_at, '+00:00', '+03:00') AS updated_at",
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          'u.phone_number AS phone_number',
          'u.user_work AS user_work',
          'u.bio AS bio',
          'u.average_rating AS average_rating',
          'u.total_ratings AS total_ratings',
          'u.is_public_profile AS is_public_profile',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfCommentEntity, 'pc')
        .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
        .where('pc.parent_id = :commentId', { commentId: dto.comment_id })
        .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 });

      const totalCount = await query.getCount();
      const replies = await query
        .orderBy('pc.created_at', 'ASC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get nested replies recursively for each reply
      for (const reply of replies) {
        reply.replies = await this.getCommentRepliesRecursive(reply.id, parentComment.postId, userId);
        reply.has_replies = reply.replies.length > 0;
        reply.replies_count = await this.getHierarchicalReplyCount(reply.id, parentComment.postId);
      }

      return {
        succeeded: true,
        replies: replies,
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
      throw new InternalServerErrorException('Failed to get comment replies: ' + error.message);
    }
  }

  /**
   * Get user's comments (actionGetUserComments)
   * Matches Yii implementation exactly
   */
  async getUserComments(
    currentUserId: string,
    dto: GetUserCommentsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.user_id || currentUserId;
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pc.id AS id',
          'pc.content AS content',
          'pc.parent_id AS parent_id',
          'pc.likes_count AS likes_count',
          'pc.replies_count AS replies_count',
          'pc.is_edited AS is_edited',
          "CONVERT_TZ(pc.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pc.updated_at, '+00:00', '+03:00') AS updated_at",
          'pc.post_id AS post_id',
          'pp.content AS post_content',
          'pp.post_type AS post_type',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfCommentEntity, 'pc')
        .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
        .leftJoin(ProfPostEntity, 'pp', 'pp.id = pc.post_id')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${currentUserId.replace(/'/g, "''")}'`)
        .where('pc.user_id = :targetUserId', { targetUserId })
        .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 });

      const totalCount = await query.getCount();
      const comments = await query
        .orderBy('pc.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        comments: comments,
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
      throw new InternalServerErrorException('Failed to get user comments: ' + error.message);
    }
  }

  /**
   * Recursively get all replies for a comment in a hierarchical structure
   */
  private async getCommentRepliesRecursive(
    commentId: number,
    postId: number,
    userId: string,
  ): Promise<any[]> {
    const replies = await this.dataSource
      .createQueryBuilder()
      .select([
        'pc.id AS id',
        'pc.content AS content',
        'pc.parent_id AS parent_id',
        'pc.user_id AS user_id',
        'pc.likes_count AS likes_count',
        'pc.replies_count AS replies_count',
        'pc.is_edited AS is_edited',
        "CONVERT_TZ(pc.created_at, '+00:00', '+03:00') AS created_at",
        "CONVERT_TZ(pc.updated_at, '+00:00', '+03:00') AS updated_at",
        'u.first_name AS first_name',
        'u.last_name AS last_name',
        'u.email AS email',
        'u.phone_number AS phone_number',
        'u.user_work AS user_work',
        'u.bio AS bio',
        'u.average_rating AS average_rating',
        'u.total_ratings AS total_ratings',
        'u.is_public_profile AS is_public_profile',
        `CASE 
          WHEN u.main_image LIKE 'http%' THEN u.main_image
          ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
        END AS user_image`,
        `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
      ])
      .from(ProfCommentEntity, 'pc')
      .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
      .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
      .where('pc.post_id = :postId', { postId })
      .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 })
      .andWhere('pc.parent_id = :commentId', { commentId })
      .orderBy('pc.created_at', 'ASC')
      .getRawMany();

    // Recursively get replies for each reply
    for (const reply of replies) {
      reply.replies = await this.getCommentRepliesRecursive(reply.id, postId, userId);
      reply.has_replies = reply.replies.length > 0;
      reply.replies_count = await this.getHierarchicalReplyCount(reply.id, postId);
    }

    return replies;
  }

  /**
   * Helper method to recursively count all replies in hierarchy
   */
  private async getHierarchicalReplyCount(commentId: number, postId: number): Promise<number> {
    // Get direct replies
    const directReplies = await this.profCommentsRepository.find({
      where: { parentId: commentId, postId, isDeleted: 0 },
    });

    let totalCount = directReplies.length;

    // Recursively count replies of replies
    for (const reply of directReplies) {
      totalCount += await this.getHierarchicalReplyCount(reply.id, postId);
    }

    return totalCount;
  }
}
