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
import { ProfPostEntity, PostType } from '../entities/prof-post.entity';
import { ProfCommentEntity } from '../entities/prof-comment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
  CreatePostDto,
  UpdatePostDto,
  GetUserPostsDto,
  GetPostDto,
  DeletePostDto,
  PinPostDto,
  GetFeedDto,
  GetTrendingPostsDto,
} from '../dto';

/**
 * Public ProfPosts Service — handles all business logic for professional posts
 */
@Injectable()
export class ProfPostsPublicService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(ProfCommentEntity)
    private readonly profCommentsRepository: Repository<ProfCommentEntity>,
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
   * Create a new professional post (actionCreatePost)
   * Matches Yii implementation exactly
   */
  async createPost(userId: string, dto: CreatePostDto, languageCode: string = 'en'): Promise<any> {
    try {
      const post = this.profPostsRepository.create({
        userId: userId,
        content: dto.content,
        description: dto.description || null,
        postType: dto.post_type || PostType.TEXT,
        attachmentId: dto.attachment_id || null,
        isPublic: dto.is_public !== undefined ? dto.is_public : 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<ProfPostEntity>);

      await this.profPostsRepository.save(post);

      return {
        succeeded: true,
        message: 'Post created successfully', // TODO: Use UtilsService.findString
        post_id: post.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create post: ' + error.message);
    }
  }

  /**
   * Get user's posts with pagination (actionGetUserPosts)
   * Matches Yii implementation exactly
   */
  async getUserPosts(
    currentUserId: string,
    dto: GetUserPostsDto,
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
          'pp.id AS id',
          'pp.user_id AS user_id',
          'pp.content AS content',
          'pp.description AS description',
          'pp.post_type AS post_type',
          'pp.likes_count AS likes_count',
          'pp.comments_count AS comments_count',
          'pp.shares_count AS shares_count',
          'pp.views_count AS views_count',
          'pp.is_pinned AS is_pinned',
          'pp.pinned_at AS pinned_at',
          'pp.is_public AS is_public',
          'pp.created_at AS created_at',
          'pp.updated_at AS updated_at',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
            ELSE NULL
          END AS user_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', a.file_path)
          END AS attachment_url`,
          'a.file_name AS file_name',
          'a.file_extension AS file_extension',
          'a.file_size AS file_size',
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'ua', 'ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1')
        .leftJoin('ag_attachment', 'a', 'a.row_id = pp.id AND a.table_name = 253')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${currentUserId.replace(/'/g, "''")}'`)
        .where('pp.user_id = :targetUserId', { targetUserId })
        .andWhere('pp.is_deleted = :isDeleted', { isDeleted: 0 });

      // Filter by visibility
      if (targetUserId !== currentUserId) {
        query.andWhere('pp.is_public = :isPublic', { isPublic: 1 });
      }

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.is_pinned', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        posts: posts,
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
      throw new InternalServerErrorException('Failed to get user posts: ' + error.message);
    }
  }

  /**
   * Get professional feed (posts from followed users) (actionGetFeed)
   * Matches Yii implementation exactly
   */
  async getFeed(userId: string, dto: GetFeedDto, languageCode: string = 'en'): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pp.id AS id',
          'pp.user_id AS user_id',
          'pp.content AS content',
          'pp.description AS description',
          'pp.post_type AS post_type',
          'pp.likes_count AS likes_count',
          'pp.comments_count AS comments_count',
          'pp.shares_count AS shares_count',
          'pp.views_count AS views_count',
          'pp.is_pinned AS is_pinned',
          "CONVERT_TZ(pp.pinned_at, '+00:00', '+03:00') AS pinned_at",
          'pp.is_public AS is_public',
          "CONVERT_TZ(pp.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pp.updated_at, '+00:00', '+03:00') AS updated_at",
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', a.file_path)
          END AS attachment_url`,
          'a.file_name AS file_name',
          'a.file_extension AS file_extension',
          'a.file_size AS file_size',
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
          `IF(pf.id IS NOT NULL, 1, 0) AS is_following`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'a', 'a.row_id = pp.id AND a.table_name = 253')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
        .leftJoin('prof_follow', 'pf', `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`)
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere(
          `(pp.user_id = '${userId.replace(/'/g, "''")}' OR EXISTS (SELECT 1 FROM prof_follow WHERE follower_id = '${userId.replace(/'/g, "''")}' AND following_id = pp.user_id AND status = 'following'))`,
        );

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        posts: posts,
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
      throw new InternalServerErrorException('Failed to get feed: ' + error.message);
    }
  }

  /**
   * Get a specific post with details (actionGetPost)
   * Matches Yii implementation exactly
   */
  async getPost(userId: string, dto: GetPostDto, languageCode: string = 'en'): Promise<any> {
    try {
      const post = await this.dataSource
        .createQueryBuilder()
        .select([
          'pp.id AS id',
          'pp.user_id AS user_id',
          'pp.content AS content',
          'pp.description AS description',
          'pp.post_type AS post_type',
          'pp.likes_count AS likes_count',
          'pp.comments_count AS comments_count',
          'pp.shares_count AS shares_count',
          'pp.views_count AS views_count',
          'pp.is_pinned AS is_pinned',
          'pp.pinned_at AS pinned_at',
          'pp.is_public AS is_public',
          'pp.created_at AS created_at',
          'pp.updated_at AS updated_at',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', a.file_path)
          END AS attachment_url`,
          'a.file_name AS file_name',
          'a.file_extension AS file_extension',
          'a.file_size AS file_size',
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
          `IF(pf.id IS NOT NULL, 1, 0) AS is_following`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'a', 'a.row_id = pp.id AND a.table_name = 253')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
        .leftJoin('prof_follow', 'pf', `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`)
        .where('pp.id = :postId', { postId: dto.post_id })
        .andWhere('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .getRawOne();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user can view this post
      if (post.is_public == 0 && post.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Increment view count
      await this.profPostsRepository.increment({ id: dto.post_id }, 'viewsCount', 1);

      return {
        succeeded: true,
        post: post,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get post: ' + error.message);
    }
  }

  /**
   * Update a post (actionUpdatePost)
   * Matches Yii implementation exactly
   */
  async updatePost(userId: string, dto: UpdatePostDto, languageCode: string = 'en'): Promise<any> {
    try {
      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user owns this post
      if (post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Update fields
      if (dto.content !== undefined) post.content = dto.content;
      if (dto.description !== undefined) post.description = dto.description;
      if (dto.post_type !== undefined) post.postType = dto.post_type;
      if (dto.attachment_id !== undefined) post.attachmentId = dto.attachment_id;
      if (dto.is_public !== undefined) post.isPublic = dto.is_public;
      post.updatedAt = new Date();

      await this.profPostsRepository.save(post);

      return {
        succeeded: true,
        message: 'Post updated successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post: ' + error.message);
    }
  }

  /**
   * Delete a post (soft delete) (actionDeletePost)
   * Matches Yii implementation exactly
   */
  async deletePost(userId: string, dto: DeletePostDto, languageCode: string = 'en'): Promise<any> {
    try {
      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user owns this post
      if (post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Soft delete
      post.isDeleted = 1;
      post.deletedAt = new Date();
      post.deletedBy = userId;
      post.updatedAt = new Date();

      await this.profPostsRepository.save(post);

      return {
        succeeded: true,
        message: 'Post deleted successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post: ' + error.message);
    }
  }

  /**
   * Pin/unpin a post (actionPinPost)
   * Matches Yii implementation exactly
   */
  async pinPost(userId: string, dto: PinPostDto, languageCode: string = 'en'): Promise<any> {
    try {
      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user owns this post
      if (post.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      post.isPinned = dto.is_pinned;
      post.pinnedAt = dto.is_pinned ? new Date() : null;
      post.updatedAt = new Date();

      await this.profPostsRepository.save(post);

      return {
        succeeded: true,
        message: dto.is_pinned ? 'Post pinned successfully' : 'Post unpinned successfully', // TODO: Use UtilsService.findString
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post: ' + error.message);
    }
  }

  /**
   * Get user posts with all details (comments, likes, etc.) (actionGetUserPostsWithDetails)
   * Matches Yii implementation exactly
   */
  async getUserPostsWithDetails(
    currentUserId: string,
    dto: GetUserPostsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.user_id || currentUserId;
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get posts (same query as getUserPosts)
      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pp.id AS id',
          'pp.user_id AS user_id',
          'pp.content AS content',
          'pp.description AS description',
          'pp.post_type AS post_type',
          'pp.likes_count AS likes_count',
          'pp.comments_count AS comments_count',
          'pp.shares_count AS shares_count',
          'pp.views_count AS views_count',
          'pp.is_pinned AS is_pinned',
          "CONVERT_TZ(pp.pinned_at, '+00:00', '+03:00') AS pinned_at",
          'pp.is_public AS is_public',
          "CONVERT_TZ(pp.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pp.updated_at, '+00:00', '+03:00') AS updated_at",
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
            ELSE NULL
          END AS user_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', a.file_path)
          END AS attachment_url`,
          'a.file_name AS file_name',
          'a.file_extension AS file_extension',
          'a.file_size AS file_size',
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'ua', 'ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1')
        .leftJoin('ag_attachment', 'a', 'a.row_id = pp.id AND a.table_name = 253')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${currentUserId.replace(/'/g, "''")}'`)
        .where('pp.user_id = :targetUserId', { targetUserId })
        .andWhere('pp.is_deleted = :isDeleted', { isDeleted: 0 });

      // Filter by visibility
      if (targetUserId !== currentUserId) {
        query.andWhere('pp.is_public = :isPublic', { isPublic: 1 });
      }

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.is_pinned', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments for each post
      for (const post of posts) {
        const comments = await this.getCommentRepliesRecursive(
          null,
          post.id,
          currentUserId,
        );
        post.comments = comments;
        post.comments_count = comments.length;
      }

      return {
        succeeded: true,
        posts: posts,
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
      throw new InternalServerErrorException('Failed to get user posts with details: ' + error.message);
    }
  }

  /**
   * Get trending posts (actionGetTrendingPosts)
   * Matches Yii implementation exactly
   */
  async getTrendingPosts(userId: string, dto: GetTrendingPostsDto, languageCode: string = 'en'): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get posts from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'pp.id AS id',
          'pp.content AS content',
          'pp.description AS description',
          'pp.post_type AS post_type',
          'pp.likes_count AS likes_count',
          'pp.comments_count AS comments_count',
          'pp.shares_count AS shares_count',
          'pp.views_count AS views_count',
          'pp.is_pinned AS is_pinned',
          "CONVERT_TZ(pp.pinned_at, '+00:00', '+03:00') AS pinned_at",
          'pp.is_public AS is_public',
          "CONVERT_TZ(pp.created_at, '+00:00', '+03:00') AS created_at",
          "CONVERT_TZ(pp.updated_at, '+00:00', '+03:00') AS updated_at",
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS user_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', a.file_path)
          END AS attachment_url`,
          'a.file_name AS file_name',
          'a.file_extension AS file_extension',
          'a.file_size AS file_size',
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
          `IF(pf.id IS NOT NULL, 1, 0) AS is_following`,
          `(pp.likes_count * 2 + pp.comments_count * 3 + pp.shares_count * 4 + pp.views_count * 0.1) AS engagement_score`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'a', 'a.row_id = pp.id AND a.table_name = 253')
        .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
        .leftJoin('prof_follow', 'pf', `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`)
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere('pp.created_at >= :sevenDaysAgo', { sevenDaysAgo });

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('engagement_score', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        posts: posts,
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
      throw new InternalServerErrorException('Failed to get trending posts: ' + error.message);
    }
  }

  /**
   * Recursively get all replies for a comment in a hierarchical structure
   * Helper method used by getUserPostsWithDetails
   */
  private async getCommentRepliesRecursive(
    parentId: number | null,
    postId: number,
    userId: string,
  ): Promise<any[]> {
    const comments = await this.dataSource
      .createQueryBuilder()
      .select([
        'pc.id AS id',
        'pc.content AS content',
        'pc.parent_id AS parent_id',
        'pc.user_id AS user_id',
        'pc.likes_count AS likes_count',
        'pc.replies_count AS replies_count',
        "CONVERT_TZ(pc.created_at, '+00:00', '+03:00') AS created_at",
        "CONVERT_TZ(pc.updated_at, '+00:00', '+03:00') AS updated_at",
        'u.first_name AS first_name',
        'u.last_name AS last_name',
        'u.email AS email',
        `CASE 
          WHEN ua.file_path LIKE 'http%' THEN ua.file_path
          WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', ua.file_path)
          WHEN u.main_image LIKE 'http%' THEN u.main_image
          WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          ELSE NULL
        END AS user_image`,
        `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
      ])
      .from(ProfCommentEntity, 'pc')
      .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
      .leftJoin('ag_attachment', 'ua', 'ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1')
      .leftJoin('prof_likes', 'pl', `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`)
      .where('pc.post_id = :postId', { postId })
      .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 })
      .andWhere(parentId === null ? 'pc.parent_id IS NULL' : 'pc.parent_id = :parentId', parentId !== null ? { parentId } : {})
      .orderBy('pc.created_at', 'ASC')
      .getRawMany();

    // Recursively get replies for each comment
    for (const comment of comments) {
      comment.replies = await this.getCommentRepliesRecursive(comment.id, postId, userId);
      comment.has_replies = comment.replies.length > 0;
    }

    return comments;
  }
}
