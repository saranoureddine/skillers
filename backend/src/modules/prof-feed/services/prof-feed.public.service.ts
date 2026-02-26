import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProfPostEntity } from '../../prof-posts/entities/prof-post.entity';
import { ProfCommentEntity } from '../../prof-posts/entities/prof-comment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { UserBlocksPublicService } from '../../user-blocks/services/user-blocks.public.service';
import { ConfigService } from '@nestjs/config';
import {
  GetPersonalizedFeedDto,
  GetTimelineDto,
  FeedGetTrendingPostsDto,
  GetPostsByProfessionDto,
  GetPostsByCategoryDto,
  GetFeedRecommendationsDto,
} from '../dto';

/**
 * Public ProfFeed Service — handles all business logic for professional feed
 * Matches Yii ProfFeedController implementation exactly
 */
@Injectable()
export class ProfFeedPublicService {
  private readonly baseHost: string;
  private readonly POSTS_TABLE = 253; // Table ID for posts
  private readonly USERS_TABLE = 210; // Table ID for users
  private readonly USER_IMAGE_TYPE = 1; // Main image type

  constructor(
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(ProfCommentEntity)
    private readonly profCommentsRepository: Repository<ProfCommentEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly userBlocksService: UserBlocksPublicService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost =
      this.configService.get<string>('BASE_HOST') ||
      process.env.BASE_HOST ||
      'http://localhost/';
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
   * Get personalized feed for user
   * Matches Yii actionGetPersonalizedFeed() exactly
   */
  async getPersonalizedFeed(
    userId: string,
    dto: GetPersonalizedFeedDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get blocked user IDs (users I blocked + users who blocked me)
      const blockedUserIds = await this.userBlocksService.getAllBlockedRelationships(userId);

      // Build base query
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
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere(
          `(pp.user_id = '${userId.replace(/'/g, "''")}' OR EXISTS (SELECT 1 FROM prof_follow WHERE follower_id = '${userId.replace(/'/g, "''")}' AND following_id = pp.user_id AND status = 'following'))`,
        );

      // Filter out blocked users
      if (blockedUserIds.length > 0) {
        query.andWhere(`pp.user_id NOT IN (${blockedUserIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')})`);
      }

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.is_pinned', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
      throw new InternalServerErrorException('Failed to get personalized feed: ' + error.message);
    }
  }

  /**
   * Get timeline - Admin view of all posts sorted by newest first
   * Matches Yii actionGetTimeline() exactly
   */
  async getTimeline(
    userId: string,
    dto: GetTimelineDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get blocked user IDs
      const blockedUserIds = await this.userBlocksService.getAllBlockedRelationships(userId);

      // Build query - all posts (no filtering by follows)
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
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 });

      // Filter out blocked users
      if (blockedUserIds.length > 0) {
        query.andWhere(`pp.user_id NOT IN (${blockedUserIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')})`);
      }

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
      throw new InternalServerErrorException('Failed to get timeline: ' + error.message);
    }
  }

  /**
   * Get trending posts
   * Matches Yii actionGetTrendingPosts() exactly
   */
  async getTrendingPosts(
    userId: string,
    dto: FeedGetTrendingPostsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get posts from last 7 days, ordered by engagement score
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

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
          `(pp.likes_count * 2 + pp.comments_count * 3 + pp.shares_count * 4 + pp.views_count * 0.1) AS engagement_score`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere('pp.created_at >= :sevenDaysAgo', { sevenDaysAgo: sevenDaysAgoStr });

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('engagement_score', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
   * Get posts by profession
   * Matches Yii actionGetPostsByProfession() exactly
   */
  async getPostsByProfession(
    userId: string,
    dto: GetPostsByProfessionDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.profession_id) {
        throw new BadRequestException('Profession ID is required');
      }

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
          'p.name AS profession_name',
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
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .innerJoin('profession_user', 'pu', 'pu.user_id = pp.user_id')
        .leftJoin('prof_categories', 'p', 'p.id = pu.profession_id')
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere('pu.profession_id = :professionId', { professionId: dto.profession_id });

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
      throw new InternalServerErrorException('Failed to get posts by profession: ' + error.message);
    }
  }

  /**
   * Get posts by category
   * Matches Yii actionGetPostsByCategory() exactly
   */
  async getPostsByCategory(
    userId: string,
    dto: GetPostsByCategoryDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.category_id) {
        throw new BadRequestException('Category ID is required');
      }

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
          'p.name AS profession_name',
          'pc.name AS category_name',
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
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .innerJoin('profession_user', 'pu', 'pu.user_id = pp.user_id')
        .leftJoin('prof_categories', 'p', 'p.id = pu.profession_id')
        .leftJoin('prof_categories', 'pc', 'pc.id = p.category_id')
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere('p.category_id = :categoryId', { categoryId: dto.category_id });

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
      throw new InternalServerErrorException('Failed to get posts by category: ' + error.message);
    }
  }

  /**
   * Get feed recommendations
   * Matches Yii actionGetFeedRecommendations() exactly
   */
  async getFeedRecommendations(
    userId: string,
    dto: GetFeedRecommendationsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Get posts not from followed users, ordered by recommendation score
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
          'p.name AS profession_name',
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
          `(pp.likes_count * 2 + pp.comments_count * 3 + pp.shares_count * 4 + pp.views_count * 0.1) AS recommendation_score`,
        ])
        .from(ProfPostEntity, 'pp')
        .leftJoin(UserEntity, 'u', 'u.id = pp.user_id')
        .leftJoin('ag_attachment', 'a', `a.row_id = pp.id AND a.table_name = ${this.POSTS_TABLE}`)
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'post' AND pl.likeable_id = pp.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .leftJoin(
          'prof_follow',
          'pf',
          `pf.follower_id = '${userId.replace(/'/g, "''")}' AND pf.following_id = pp.user_id AND pf.status = 'following'`,
        )
        .leftJoin('profession_user', 'pu', 'pu.user_id = pp.user_id')
        .leftJoin('prof_categories', 'p', 'p.id = pu.profession_id')
        .where('pp.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pp.is_public = :isPublic', { isPublic: 1 })
        .andWhere(
          `pp.user_id NOT IN (SELECT following_id FROM prof_follow WHERE follower_id = '${userId.replace(/'/g, "''")}' AND status = 'following')`,
        )
        .andWhere(`pp.user_id != '${userId.replace(/'/g, "''")}'`);

      const totalCount = await query.getCount();
      const posts = await query
        .orderBy('recommendation_score', 'DESC')
        .addOrderBy('pp.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get comments and attachments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const postId = post.id;
          post.attachments = await this.getPostAttachments(postId);
          post.comments = await this.getPostComments(postId, userId);
          return post;
        }),
      );

      return {
        succeeded: true,
        posts: postsWithDetails,
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
      throw new InternalServerErrorException('Failed to get feed recommendations: ' + error.message);
    }
  }

  /**
   * Get all images/attachments for a post
   * Matches Yii getPostAttachments() exactly
   */
  private async getPostAttachments(postId: number): Promise<any[]> {
    try {
      const attachments = await this.dataSource
        .createQueryBuilder()
        .select([
          'id',
          'file_name',
          'file_extension',
          'file_size',
          `CASE 
            WHEN file_path LIKE 'http%' THEN file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', file_path)
          END AS file_path`,
          'type',
          `IF(file_extension IN ('mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'), 1, 0) AS is_video`,
        ])
        .from('ag_attachment', 'ag_attachment')
        .where('table_name = :tableName', { tableName: this.POSTS_TABLE })
        .andWhere('row_id = :rowId', { rowId: postId })
        .orderBy('id', 'ASC')
        .getRawMany();

      return attachments;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get comments for a post with nested replies
   * Matches Yii getPostComments() and getCommentRepliesRecursive() exactly
   */
  private async getPostComments(postId: number, userId: string): Promise<any[]> {
    try {
      // Get top-level comments (parent_id is null)
      const comments = await this.dataSource
        .createQueryBuilder()
        .select([
          'pc.id AS id',
          'pc.content AS content',
          'pc.parent_id AS parent_id',
          'pc.user_id AS user_id',
          'pc.likes_count AS likes_count',
          'pc.replies_count AS replies_count',
          'pc.created_at AS created_at',
          'pc.updated_at AS updated_at',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', ua.file_path)
          END AS user_image`,
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfCommentEntity, 'pc')
        .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
        .leftJoin(
          'ag_attachment',
          'ua',
          `ua.row_id = u.id AND ua.table_name = ${this.USERS_TABLE} AND ua.type = ${this.USER_IMAGE_TYPE}`,
        )
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .where('pc.post_id = :postId', { postId })
        .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pc.parent_id IS NULL')
        .orderBy('pc.created_at', 'ASC')
        .getRawMany();

      // Get replies recursively for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          comment.replies = await this.getCommentRepliesRecursive(comment.id, postId, userId);
          comment.has_replies = comment.replies.length > 0;
          return comment;
        }),
      );

      return commentsWithReplies;
    } catch (error) {
      return [];
    }
  }

  /**
   * Recursively get all replies for a comment in a hierarchical structure
   * Matches Yii getCommentRepliesRecursive() exactly
   */
  private async getCommentRepliesRecursive(
    commentId: number,
    postId: number,
    userId: string,
  ): Promise<any[]> {
    try {
      const replies = await this.dataSource
        .createQueryBuilder()
        .select([
          'pc.id AS id',
          'pc.content AS content',
          'pc.parent_id AS parent_id',
          'pc.user_id AS user_id',
          'pc.likes_count AS likes_count',
          'pc.replies_count AS replies_count',
          'pc.created_at AS created_at',
          'pc.updated_at AS updated_at',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          `CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', ua.file_path)
          END AS user_image`,
          `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
        ])
        .from(ProfCommentEntity, 'pc')
        .leftJoin(UserEntity, 'u', 'u.id = pc.user_id')
        .leftJoin(
          'ag_attachment',
          'ua',
          `ua.row_id = u.id AND ua.table_name = ${this.USERS_TABLE} AND ua.type = ${this.USER_IMAGE_TYPE}`,
        )
        .leftJoin(
          'prof_likes',
          'pl',
          `pl.likeable_type = 'comment' AND pl.likeable_id = pc.id AND pl.user_id = '${userId.replace(/'/g, "''")}'`,
        )
        .where('pc.post_id = :postId', { postId })
        .andWhere('pc.is_deleted = :isDeleted', { isDeleted: 0 })
        .andWhere('pc.parent_id = :parentId', { parentId: commentId })
        .orderBy('pc.created_at', 'ASC')
        .getRawMany();

      // Recursively get replies for each reply
      const repliesWithNested = await Promise.all(
        replies.map(async (reply) => {
          reply.replies = await this.getCommentRepliesRecursive(reply.id, postId, userId);
          reply.has_replies = reply.replies.length > 0;
          return reply;
        }),
      );

      return repliesWithNested;
    } catch (error) {
      return [];
    }
  }
}
