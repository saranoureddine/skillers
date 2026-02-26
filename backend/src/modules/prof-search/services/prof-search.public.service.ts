import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';
import { ProfPostEntity } from '../../prof-posts/entities/prof-post.entity';
import { AgAttachmentEntity } from '../../attachments/entities/ag-attachment.entity';
import { CityEntity } from '../../cities-members/entities/city.entity';
import {
  GlobalSearchDto,
  SearchProfessionsDto,
  SearchUsersByProfessionDto,
  GetProfessionTrendsDto,
} from '../dto';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../../common/services/utils.service';

/**
 * Public ProfSearch service — handles all search endpoints matching Yii API
 */
@Injectable()
export class ProfSearchPublicService {
  private readonly logger = new Logger(ProfSearchPublicService.name);
  private readonly baseHost: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(AgAttachmentEntity)
    private readonly agAttachmentRepository: Repository<AgAttachmentEntity>,
    @InjectRepository(CityEntity)
    private readonly citiesRepository: Repository<CityEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
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
   * Global search across posts, groups, professions, categories, and users
   * Matches Yii actionGlobalSearch
   */
  async globalSearch(
    userId: string,
    languageCode: string,
    dto: GlobalSearchDto,
  ): Promise<any> {
    try {
      const query = (dto.query || '').trim();
      const type = dto.type || 'all';
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const cities = dto.cities || [];
      const categories = dto.categories || [];
      const subcategories = dto.subcategories || [];
      const latitude = dto.latitude;
      const longitude = dto.longitude;

      // Validate coordinates for sorting
      const useLocationSorting =
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined &&
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      // Check if we have either a query or filters
      const hasQuery = query.length >= 1;
      const hasFilters = cities.length > 0 || categories.length > 0 || subcategories.length > 0;

      if (!hasQuery && !hasFilters) {
        throw new BadRequestException(
          await this.utilsService.findString(
            'Either search query (min 1 character) or filters are required',
            languageCode,
          ),
        );
      }

      const results: any = {
        posts: [],
        groups: [],
        professions: [],
        categories: [],
        users: [],
      };

      let totalCount = 0;

      // Search posts
      if (type === 'all' || type === 'posts') {
        const postCountQuery = this.profPostsRepository
          .createQueryBuilder('pp')
          .where('pp.isDeleted = 0')
          .andWhere('pp.isPublic = 1');

        if (hasQuery) {
          postCountQuery.andWhere(
            '(pp.content LIKE :query OR pp.description LIKE :query)',
            { query: `%${query}%` },
          );
        }

        const postCount = await postCountQuery.getCount();

        if (postCount > 0) {
          const postDataQuery = this.dataSource
            .createQueryBuilder()
            .select([
              'pp.id',
              'pp.content',
              'pp.description',
              'pp.post_type',
              'pp.likes_count',
              'pp.comments_count',
              'pp.shares_count',
              'pp.created_at',
              'u.first_name',
              'u.last_name',
              `CASE 
                WHEN ua.file_path LIKE 'http%' THEN ua.file_path
                WHEN ua.file_path IS NOT NULL THEN CONCAT(:base_host, ua.file_path)
                WHEN u.main_image LIKE 'http%' THEN u.main_image
                ELSE CONCAT(:base_host, u.main_image)
              END AS user_image`,
              `IF(pl.id IS NOT NULL, 1, 0) AS is_liked`,
            ])
            .from(ProfPostEntity, 'pp')
            .leftJoin('users', 'u', 'u.id = pp.user_id')
            .leftJoin(
              'ag_attachment',
              'ua',
              'ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1',
            )
            .leftJoin(
              'prof_likes',
              'pl',
              'pl.likeable_type = "post" AND pl.likeable_id = pp.id AND pl.user_id = :user_id',
            )
            .where('pp.is_deleted = 0')
            .andWhere('pp.is_public = 1')
            .setParameter('base_host', this.baseHost)
            .setParameter('user_id', userId);

          if (hasQuery) {
            postDataQuery.andWhere(
              '(pp.content LIKE :query OR pp.description LIKE :query)',
              { query: `%${query}%` },
            );
          }

          const posts = await postDataQuery
            .orderBy('pp.created_at', 'DESC')
            .limit(limit)
            .getRawMany();

          results.posts = posts;
          totalCount += postCount;
        }
      }

      // Search groups (using raw SQL since ProfGroups entity doesn't exist)
      if (type === 'all' || type === 'groups') {
        let groupCountQuery = `
          SELECT COUNT(DISTINCT pg.id) as count
          FROM prof_groups pg
          WHERE pg.is_active = 1
        `;
        const groupCountParams: any[] = [];

        if (hasQuery) {
          groupCountQuery += ` AND (pg.name LIKE ? OR pg.description LIKE ?)`;
          groupCountParams.push(`%${query}%`, `%${query}%`);
        }

        const groupCountResult = await this.dataSource.query(groupCountQuery, groupCountParams);
        const groupCount = groupCountResult[0]?.count || 0;

        if (groupCount > 0) {
          let groupDataQuery = `
            SELECT 
              pg.id,
              pg.name,
              pg.description,
              pg.members_count,
              pg.posts_count,
              pg.is_public,
              pg.created_at,
              pc.name AS category_name,
              u.first_name AS owner_first_name,
              u.last_name AS owner_last_name,
              CASE 
                WHEN pg.cover_image LIKE 'http%' THEN pg.cover_image
                ELSE CONCAT(?, pg.cover_image)
              END AS cover_image_url,
              IF(pgm.id IS NOT NULL, 1, 0) AS is_member
            FROM prof_groups pg
            LEFT JOIN prof_categories pc ON pc.id = pg.category_id
            LEFT JOIN users u ON u.id = pg.owner_id
            LEFT JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
            WHERE pg.is_active = 1
          `;
          const groupDataParams: any[] = [this.baseHost, userId];

          if (hasQuery) {
            groupDataQuery += ` AND (pg.name LIKE ? OR pg.description LIKE ?)`;
            groupDataParams.push(`%${query}%`, `%${query}%`);
          }

          groupDataQuery += ` ORDER BY pg.created_at DESC LIMIT ?`;
          groupDataParams.push(limit);

          const groups = await this.dataSource.query(groupDataQuery, groupDataParams);
          results.groups = groups;
          totalCount += groupCount;
        }
      }

      // Search professions
      if (type === 'all' || type === 'professions') {
        let professionCountQuery = this.profCategoriesRepository
          .createQueryBuilder('p')
          .where('p.isActive = 1');

        if (hasQuery) {
          professionCountQuery.andWhere(
            '(p.name LIKE :query OR p.nameAr LIKE :query OR p.description LIKE :query OR p.descriptionAr LIKE :query)',
            { query: `%${query}%` },
          );
        }

        if (cities.length > 0) {
          professionCountQuery
            .innerJoin('profession_user', 'pu', 'pu.profession_id = p.id')
            .innerJoin('users', 'u', 'u.id = pu.user_id AND u.is_activated = 1')
            .innerJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .andWhere('uc.city_id IN (:...cities)', { cities });
        }

        if (categories.length > 0) {
          professionCountQuery.andWhere('p.parentId IN (:...categories)', { categories });
        }

        if (subcategories.length > 0) {
          professionCountQuery.andWhere('p.id IN (:...subcategories)', { subcategories });
        }

        const professionCount = await professionCountQuery.getCount();

        if (professionCount > 0) {
          const professionDataQuery = this.dataSource
            .createQueryBuilder()
            .select([
              'p.id',
              languageCode === 'ar' ? 'p.name_ar AS name' : 'p.name AS name',
              languageCode === 'ar'
                ? 'p.description_ar AS description'
                : 'p.description AS description',
              'p.parent_id',
              languageCode === 'ar' ? 'pc.name_ar AS category_name' : 'pc.name AS category_name',
              'COUNT(DISTINCT pu.user_id) AS users_count',
              `CASE 
                WHEN a.file_path LIKE 'http%' THEN a.file_path
                ELSE CONCAT(:base_host, a.file_path)
              END AS icon_url`,
            ])
            .from(ProfCategoryEntity, 'p')
            .leftJoin(
              'ag_attachment',
              'a',
              'a.row_id = p.id AND a.table_name = 251 AND a.type = 1',
            )
            .leftJoin('prof_categories', 'pc', 'pc.id = p.parent_id')
            .leftJoin('profession_user', 'pu', 'pu.profession_id = p.id')
            .leftJoin('users', 'u', 'u.id = pu.user_id AND u.is_activated = 1')
            .leftJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .leftJoin('cities', 'c', 'c.id = uc.city_id')
            .where('p.is_active = 1')
            .setParameter('base_host', this.baseHost)
            .groupBy('p.id');

          if (hasQuery) {
            professionDataQuery.andWhere(
              '(p.name LIKE :query OR p.name_ar LIKE :query OR p.description LIKE :query OR p.description_ar LIKE :query)',
              { query: `%${query}%` },
            );
          }

          if (cities.length > 0) {
            professionDataQuery.andWhere('uc.city_id IN (:...cities)', { cities });
          }

          if (categories.length > 0) {
            professionDataQuery.andWhere('p.parent_id IN (:...categories)', { categories });
          }

          if (subcategories.length > 0) {
            professionDataQuery.andWhere('p.id IN (:...subcategories)', { subcategories });
          }

          const professions = await professionDataQuery
            .orderBy('p.name', 'ASC')
            .limit(limit)
            .getRawMany();

          // Get users for each profession
          for (const profession of professions) {
            let usersQuery = `
              SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.bio,
                u.followers_count,
                u.following_count,
                uc.city_id,
                ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} AS city_name,
                pu.experience_years,
                pu.is_verified,
                CASE 
                  WHEN ua.file_path LIKE 'http%' THEN ua.file_path
                  WHEN ua.file_path IS NOT NULL THEN CONCAT(?, ua.file_path)
                  WHEN u.main_image LIKE 'http%' THEN u.main_image
                  ELSE CONCAT(?, u.main_image)
                END AS main_image,
                IF(pf.id IS NOT NULL, 1, 0) AS is_following
            `;

            if (useLocationSorting) {
              usersQuery += `, haversine_km(?, ?, u.latitude, u.longitude) AS distance_km`;
            } else {
              usersQuery += `, NULL AS distance_km`;
            }

            usersQuery += `
              FROM users u
              LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1
              LEFT JOIN user_cities uc ON uc.user_id = u.id
              LEFT JOIN cities c ON c.id = uc.city_id
              LEFT JOIN profession_user pu ON pu.user_id = u.id
              LEFT JOIN prof_follow pf ON pf.follower_id = ? AND pf.following_id = u.id AND pf.status = 'following'
              WHERE u.is_activated = 1 
                AND pu.profession_id = ?
                AND u.latitude IS NOT NULL
                AND u.longitude IS NOT NULL
            `;

            const usersParams: any[] = [
              this.baseHost,
              this.baseHost,
              userId,
              profession.id,
            ];

            if (useLocationSorting) {
              usersParams.unshift(longitude, latitude);
            }

            if (cities.length > 0) {
              usersQuery += ` AND uc.city_id IN (${cities.map(() => '?').join(',')})`;
              usersParams.push(...cities);
            }

            if (useLocationSorting) {
              usersQuery += ` ORDER BY distance_km ASC`;
            } else {
              usersQuery += ` ORDER BY u.followers_count DESC`;
            }

            const users = await this.dataSource.query(usersQuery, usersParams);
            profession.users = users;
          }

          results.professions = professions;
          totalCount += professionCount;
        }
      }

      // Search categories
      if (type === 'all' || type === 'categories') {
        let categoryCountQuery = this.profCategoriesRepository
          .createQueryBuilder('pc')
          .where('pc.isActive = 1')
          .andWhere('pc.parentId IS NULL');

        if (hasQuery) {
          categoryCountQuery.andWhere(
            '(pc.name LIKE :query OR pc.nameAr LIKE :query OR pc.description LIKE :query OR pc.descriptionAr LIKE :query)',
            { query: `%${query}%` },
          );
        }

        if (cities.length > 0) {
          categoryCountQuery
            .innerJoin('prof_categories', 'prof', 'prof.parent_id = pc.id AND prof.is_active = 1')
            .innerJoin('profession_user', 'pu', 'pu.profession_id = prof.id')
            .innerJoin('users', 'u', 'u.id = pu.user_id AND u.is_activated = 1')
            .innerJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .andWhere('uc.city_id IN (:...cities)', { cities });
        }

        if (categories.length > 0) {
          categoryCountQuery.andWhere('pc.id IN (:...categories)', { categories });
        }

        const categoryCount = await categoryCountQuery.getCount();

        if (categoryCount > 0) {
          const categoryDataQuery = this.dataSource
            .createQueryBuilder()
            .select([
              'pc.id',
              languageCode === 'ar' ? 'pc.name_ar AS name' : 'pc.name AS name',
              languageCode === 'ar'
                ? 'pc.description_ar AS description'
                : 'pc.description AS description',
              'pc.parent_id',
              'COUNT(DISTINCT sub.id) AS subcategories_count',
              'COUNT(DISTINCT prof.id) AS professions_count',
              `CASE 
                WHEN a.file_path LIKE 'http%' THEN a.file_path
                ELSE CONCAT(:base_host, a.file_path)
              END AS icon_url`,
            ])
            .from(ProfCategoryEntity, 'pc')
            .leftJoin(
              'ag_attachment',
              'a',
              `a.id = (
                SELECT a2.id FROM ag_attachment a2 
                WHERE a2.row_id = pc.id AND a2.table_name = 251 AND a2.type = 1 
                ORDER BY a2.created_at DESC LIMIT 1
              )`,
            )
            .leftJoin('prof_categories', 'sub', 'sub.parent_id = pc.id AND sub.is_active = 1')
            .leftJoin('prof_categories', 'prof', 'prof.parent_id = pc.id AND prof.is_active = 1')
            .leftJoin('profession_user', 'pu', 'pu.profession_id = prof.id')
            .leftJoin('users', 'u', 'u.id = pu.user_id AND u.is_activated = 1')
            .leftJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .leftJoin('cities', 'c', 'c.id = uc.city_id')
            .where('pc.is_active = 1')
            .andWhere('pc.parent_id IS NULL')
            .setParameter('base_host', this.baseHost)
            .groupBy('pc.id');

          if (hasQuery) {
            categoryDataQuery.andWhere(
              '(pc.name LIKE :query OR pc.name_ar LIKE :query OR pc.description LIKE :query OR pc.description_ar LIKE :query)',
              { query: `%${query}%` },
            );
          }

          if (cities.length > 0) {
            categoryDataQuery.andWhere('uc.city_id IN (:...cities)', { cities });
          }

          if (categories.length > 0) {
            categoryDataQuery.andWhere('pc.id IN (:...categories)', { categories });
          }

          const categoryResults = await categoryDataQuery
            .orderBy('pc.name', 'ASC')
            .limit(limit)
            .getRawMany();

          // Get users for each category through their professions
          for (const category of categoryResults) {
            let usersQuery = `
              SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.bio,
                u.followers_count,
                u.following_count,
                uc.city_id,
                ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} AS city_name,
                ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} AS profession_name,
                pu.experience_years,
                pu.is_verified,
                CASE 
                  WHEN ua.file_path LIKE 'http%' THEN ua.file_path
                  WHEN ua.file_path IS NOT NULL THEN CONCAT(?, ua.file_path)
                  WHEN u.main_image LIKE 'http%' THEN u.main_image
                  ELSE CONCAT(?, u.main_image)
                END AS main_image,
                IF(pf.id IS NOT NULL, 1, 0) AS is_following
            `;

            if (useLocationSorting) {
              usersQuery += `, haversine_km(?, ?, u.latitude, u.longitude) AS distance_km`;
            } else {
              usersQuery += `, NULL AS distance_km`;
            }

            usersQuery += `
              FROM users u
              LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1
              LEFT JOIN user_cities uc ON uc.user_id = u.id
              LEFT JOIN cities c ON c.id = uc.city_id
              LEFT JOIN profession_user pu ON pu.user_id = u.id
              LEFT JOIN prof_categories p ON p.id = pu.profession_id
              LEFT JOIN prof_follow pf ON pf.follower_id = ? AND pf.following_id = u.id AND pf.status = 'following'
              WHERE u.is_activated = 1 
                AND p.parent_id = ?
                AND p.is_active = 1
                AND u.latitude IS NOT NULL
                AND u.longitude IS NOT NULL
            `;

            const usersParams: any[] = [
              this.baseHost,
              this.baseHost,
              userId,
              category.id,
            ];

            if (useLocationSorting) {
              usersParams.unshift(longitude, latitude);
            }

            if (cities.length > 0) {
              usersQuery += ` AND uc.city_id IN (${cities.map(() => '?').join(',')})`;
              usersParams.push(...cities);
            }

            if (useLocationSorting) {
              usersQuery += ` ORDER BY distance_km ASC`;
            } else {
              usersQuery += ` ORDER BY u.followers_count DESC`;
            }

            const users = await this.dataSource.query(usersQuery, usersParams);
            category.users = users;
          }

          results.categories = categoryResults;
          totalCount += categoryCount;
        }
      }

      // Search users
      if (type === 'all' || type === 'users') {
        let userCountQuery = this.usersRepository
          .createQueryBuilder('u')
          .where('u.isActivated = 1');

        if (hasQuery) {
          userCountQuery.andWhere(
            '(u.firstName LIKE :query OR u.lastName LIKE :query OR u.email LIKE :query OR u.bio LIKE :query OR CONCAT(u.firstName, " ", u.lastName) LIKE :fullName)',
            { query: `%${query}%`, fullName: `%${query}%` },
          );
        }

        if (cities.length > 0) {
          userCountQuery
            .innerJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .andWhere('uc.city_id IN (:...cities)', { cities });
        }

        const userCount = await userCountQuery.getCount();

        if (userCount > 0) {
          const userDataQuery = this.dataSource
            .createQueryBuilder()
            .select([
              'u.id',
              'u.first_name',
              'u.last_name',
              'u.email',
              'u.bio',
              'u.followers_count',
              'u.following_count',
              'uc.city_id',
              languageCode === 'ar'
                ? 'c.city_name_ar AS city_name'
                : 'c.city_name AS city_name',
              `CASE 
                WHEN ua.file_path LIKE 'http%' THEN ua.file_path
                WHEN ua.file_path IS NOT NULL THEN CONCAT(:base_host, ua.file_path)
                WHEN u.main_image LIKE 'http%' THEN u.main_image
                ELSE CONCAT(:base_host, u.main_image)
              END AS main_image`,
              `IF(pf.id IS NOT NULL, 1, 0) AS is_following`,
            ])
            .from(UserEntity, 'u')
            .leftJoin(
              'ag_attachment',
              'ua',
              'ua.row_id = u.id AND ua.table_name = 210 AND ua.type = 1',
            )
            .leftJoin('user_cities', 'uc', 'uc.user_id = u.id')
            .leftJoin('cities', 'c', 'c.id = uc.city_id')
            .leftJoin(
              'prof_follow',
              'pf',
              'pf.follower_id = :user_id AND pf.following_id = u.id AND pf.status = "following"',
            )
            .where('u.is_activated = 1')
            .setParameter('base_host', this.baseHost)
            .setParameter('user_id', userId)
            .groupBy('u.id');

          if (useLocationSorting) {
            userDataQuery.addSelect(
              `haversine_km(:latitude, :longitude, u.latitude, u.longitude) AS distance_km`,
            );
            userDataQuery.setParameter('latitude', latitude);
            userDataQuery.setParameter('longitude', longitude);
          } else {
            userDataQuery.addSelect(`NULL AS distance_km`);
          }

          if (hasQuery) {
            userDataQuery.andWhere(
              '(u.first_name LIKE :query OR u.last_name LIKE :query OR u.email LIKE :query OR u.bio LIKE :query OR CONCAT(u.first_name, " ", u.last_name) LIKE :fullName)',
              { query: `%${query}%`, fullName: `%${query}%` },
            );
          }

          if (cities.length > 0) {
            userDataQuery.andWhere('uc.city_id IN (:...cities)', { cities });
          }

          if (useLocationSorting) {
            userDataQuery.orderBy('distance_km', 'ASC');
          } else {
            userDataQuery.orderBy('u.followers_count', 'DESC');
          }

          const allUsers = await userDataQuery.limit(limit).getRawMany();

          // Get professions for each user
          for (const user of allUsers) {
            const professionsQuery = `
              SELECT 
                p.id,
                ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} AS profession_name,
                pu.experience_years,
                pu.is_verified
              FROM prof_categories p
              LEFT JOIN profession_user pu ON pu.profession_id = p.id
              WHERE pu.user_id = ? AND p.is_active = 1
            `;
            const professions = await this.dataSource.query(professionsQuery, [user.id]);
            user.professions = professions;
          }

          results.users = allUsers;
          totalCount += userCount;
        }
      }

      return {
        succeeded: true,
        query: query,
        type: type,
        results: results,
        total_count: totalCount,
        filters: {
          cities: cities,
          categories: categories,
          subcategories: subcategories,
        },
        location_sorting: {
          enabled: useLocationSorting,
          latitude: latitude || null,
          longitude: longitude || null,
        },
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in globalSearch:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to perform global search');
    }
  }

  /**
   * Search professions with advanced filtering
   * Matches Yii actionSearchProfessions
   */
  async searchProfessions(
    languageCode: string,
    dto: SearchProfessionsDto,
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      let countQuery = this.profCategoriesRepository
        .createQueryBuilder('prof_categories')
        .leftJoin('prof_categories', 'pc', 'pc.id = prof_categories.parent_id')
        .leftJoin('profession_user', 'pu', 'pu.profession_id = prof_categories.id')
        .where('prof_categories.is_active = 1')
        .andWhere('prof_categories.parent_id IS NOT NULL')
        .groupBy('prof_categories.id');

      if (dto.search) {
        countQuery.andWhere(
          '(prof_categories.name LIKE :search OR prof_categories.name_ar LIKE :search OR prof_categories.description LIKE :search OR prof_categories.description_ar LIKE :search OR pc.name LIKE :search OR pc.name_ar LIKE :search)',
          { search: `%${dto.search}%` },
        );
      }

      if (dto.category_id) {
        countQuery.andWhere('prof_categories.parent_id = :categoryId', {
          categoryId: dto.category_id,
        });
      }

      if (dto.parent_category_id) {
        countQuery.andWhere('pc.parent_id = :parentCategoryId', {
          parentCategoryId: dto.parent_category_id,
        });
      }

      // For count with HAVING, we need a subquery
      const totalCount = await countQuery.getCount();

      const dataQuery = this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          languageCode === 'ar'
            ? 'prof_categories.name_ar AS name'
            : 'prof_categories.name AS name',
          languageCode === 'ar'
            ? 'prof_categories.description_ar AS description'
            : 'prof_categories.description AS description',
          'prof_categories.parent_id',
          'prof_categories.sort_order',
          'prof_categories.icon_attachment_id',
          languageCode === 'ar' ? 'pc.name_ar AS category_name' : 'pc.name AS category_name',
          languageCode === 'ar'
            ? 'pc.description_ar AS category_description'
            : 'pc.description AS category_description',
          'COUNT(DISTINCT pu.user_id) AS users_count',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS icon_url`,
        ])
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin('prof_categories', 'pc', 'pc.id = prof_categories.parent_id')
        .leftJoin('profession_user', 'pu', 'pu.profession_id = prof_categories.id')
        .leftJoin(
          'ag_attachment',
          'a',
          'a.row_id = prof_categories.id AND a.table_name = 231 AND a.type = 1',
        )
        .where('prof_categories.is_active = 1')
        .andWhere('prof_categories.parent_id IS NOT NULL')
        .groupBy('prof_categories.id')
        .setParameter('base_host', this.baseHost);

      if (dto.search) {
        dataQuery.andWhere(
          '(prof_categories.name LIKE :search OR prof_categories.name_ar LIKE :search OR prof_categories.description LIKE :search OR prof_categories.description_ar LIKE :search OR pc.name LIKE :search OR pc.name_ar LIKE :search)',
          { search: `%${dto.search}%` },
        );
      }

      if (dto.category_id) {
        dataQuery.andWhere('prof_categories.parent_id = :categoryId', {
          categoryId: dto.category_id,
        });
      }

      if (dto.parent_category_id) {
        dataQuery.andWhere('pc.parent_id = :parentCategoryId', {
          parentCategoryId: dto.parent_category_id,
        });
      }

      if (dto.min_users) {
        dataQuery.having('users_count >= :minUsers', { minUsers: dto.min_users });
      }

      if (dto.max_users) {
        dataQuery.having('users_count <= :maxUsers', { maxUsers: dto.max_users });
      }

      // Sorting
      const sortBy = dto.sort_by || 'name';
      const sortOrder = dto.sort_order || 'ASC';

      switch (sortBy) {
        case 'name':
          dataQuery.orderBy(
            'prof_categories.name',
            sortOrder === 'DESC' ? 'DESC' : 'ASC',
          );
          break;
        case 'users_count':
          dataQuery.orderBy('users_count', sortOrder === 'DESC' ? 'DESC' : 'ASC');
          break;
        case 'sort_order':
          dataQuery.orderBy(
            'prof_categories.sort_order',
            sortOrder === 'DESC' ? 'DESC' : 'ASC',
          );
          break;
        case 'created_at':
          dataQuery.orderBy(
            'prof_categories.created_at',
            sortOrder === 'DESC' ? 'DESC' : 'ASC',
          );
          break;
        default:
          dataQuery
            .orderBy('prof_categories.sort_order', 'ASC')
            .addOrderBy('prof_categories.name', 'ASC');
      }

      const professions = await dataQuery.offset(offset).limit(limit).getRawMany();

      return {
        succeeded: true,
        professions: professions,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in searchProfessions:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to search professions');
    }
  }

  /**
   * Search users by profession with advanced filtering
   * Matches Yii actionSearchUsersByProfession
   */
  async searchUsersByProfession(
    userId: string,
    languageCode: string,
    dto: SearchUsersByProfessionDto,
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      let countQuery = this.dataSource
        .createQueryBuilder()
        .from('profession_user', 'pu')
        .leftJoin('users', 'u', 'u.id = pu.user_id')
        .leftJoin('prof_categories', 'p', 'p.id = pu.profession_id')
        .leftJoin('prof_categories', 'pc', 'pc.id = p.parent_id')
        .where('u.is_activated = 1');

      if (dto.profession_id) {
        countQuery.andWhere('pu.profession_id = :professionId', {
          professionId: dto.profession_id,
        });
      }

      if (dto.category_id) {
        countQuery.andWhere('p.parent_id = :categoryId', {
          categoryId: dto.category_id,
        });
      }

      if (dto.is_primary !== undefined && dto.is_primary !== null) {
        countQuery.andWhere('pu.is_primary = :isPrimary', {
          isPrimary: dto.is_primary,
        });
      }

      if (dto.is_verified !== undefined && dto.is_verified !== null) {
        countQuery.andWhere('pu.is_verified = :isVerified', {
          isVerified: dto.is_verified,
        });
      }

      if (dto.min_experience) {
        countQuery.andWhere('pu.experience_years >= :minExperience', {
          minExperience: dto.min_experience,
        });
      }

      if (dto.max_experience) {
        countQuery.andWhere('pu.experience_years <= :maxExperience', {
          maxExperience: dto.max_experience,
        });
      }

      if (dto.search) {
        countQuery.andWhere(
          '(u.first_name LIKE :search OR u.last_name LIKE :search OR u.email LIKE :search OR p.name LIKE :search OR p.name_ar LIKE :search)',
          { search: `%${dto.search}%` },
        );
      }

      if (dto.gender) {
        countQuery.andWhere('u.gender = :gender', { gender: dto.gender });
      }

      const totalCount = await countQuery.getCount();

      const dataQuery = this.dataSource
        .createQueryBuilder()
        .select([
          'pu.id',
          'pu.user_id',
          'pu.profession_id',
          'pu.is_primary',
          'pu.experience_years',
          'pu.is_verified',
          'pu.verified_at',
          'u.first_name',
          'u.last_name',
          'u.email',
          'u.phone_number',
          'u.gender',
          'u.birth_date',
          languageCode === 'ar' ? 'p.name_ar AS profession_name' : 'p.name AS profession_name',
          languageCode === 'ar' ? 'pc.name_ar AS category_name' : 'pc.name AS category_name',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(:base_host, u.main_image)
          END AS main_image`,
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS profession_icon`,
        ])
        .from('profession_user', 'pu')
        .leftJoin('users', 'u', 'u.id = pu.user_id')
        .leftJoin('prof_categories', 'p', 'p.id = pu.profession_id')
        .leftJoin('prof_categories', 'pc', 'pc.id = p.parent_id')
        .leftJoin(
          'ag_attachment',
          'a',
          'a.row_id = p.id AND a.table_name = 231 AND a.type = 1',
        )
        .where('u.is_activated = 1')
        .setParameter('base_host', this.baseHost);

      // Apply same filters as count query
      if (dto.profession_id) {
        dataQuery.andWhere('pu.profession_id = :professionId', {
          professionId: dto.profession_id,
        });
      }

      if (dto.category_id) {
        dataQuery.andWhere('p.parent_id = :categoryId', {
          categoryId: dto.category_id,
        });
      }

      if (dto.is_primary !== undefined && dto.is_primary !== null) {
        dataQuery.andWhere('pu.is_primary = :isPrimary', {
          isPrimary: dto.is_primary,
        });
      }

      if (dto.is_verified !== undefined && dto.is_verified !== null) {
        dataQuery.andWhere('pu.is_verified = :isVerified', {
          isVerified: dto.is_verified,
        });
      }

      if (dto.min_experience) {
        dataQuery.andWhere('pu.experience_years >= :minExperience', {
          minExperience: dto.min_experience,
        });
      }

      if (dto.max_experience) {
        dataQuery.andWhere('pu.experience_years <= :maxExperience', {
          maxExperience: dto.max_experience,
        });
      }

      if (dto.search) {
        dataQuery.andWhere(
          '(u.first_name LIKE :search OR u.last_name LIKE :search OR u.email LIKE :search OR p.name LIKE :search OR p.name_ar LIKE :search)',
          { search: `%${dto.search}%` },
        );
      }

      if (dto.gender) {
        dataQuery.andWhere('u.gender = :gender', { gender: dto.gender });
      }

      // Sorting
      const sortBy = dto.sort_by || 'first_name';
      const sortOrder = dto.sort_order || 'ASC';

      switch (sortBy) {
        case 'first_name':
          dataQuery.orderBy('u.first_name', sortOrder === 'DESC' ? 'DESC' : 'ASC');
          break;
        case 'last_name':
          dataQuery.orderBy('u.last_name', sortOrder === 'DESC' ? 'DESC' : 'ASC');
          break;
        case 'experience_years':
          dataQuery.orderBy(
            'pu.experience_years',
            sortOrder === 'DESC' ? 'DESC' : 'ASC',
          );
          break;
        case 'is_verified':
          dataQuery.orderBy('pu.is_verified', sortOrder === 'DESC' ? 'DESC' : 'ASC');
          break;
        case 'created_at':
          dataQuery.orderBy('pu.created_at', sortOrder === 'DESC' ? 'DESC' : 'ASC');
          break;
        default:
          dataQuery.orderBy('u.first_name', 'ASC');
      }

      const users = await dataQuery.offset(offset).limit(limit).getRawMany();

      return {
        succeeded: true,
        users: users,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in searchUsersByProfession:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to search users by profession');
    }
  }

  /**
   * Get profession statistics
   * Matches Yii actionGetProfessionStats
   */
  async getProfessionStats(languageCode: string): Promise<any> {
    try {
      // Total professions (subcategories only)
      const totalProfessions = await this.profCategoriesRepository
        .createQueryBuilder('p')
        .where('p.isActive = 1')
        .andWhere('p.parentId IS NOT NULL')
        .getCount();

      // Total categories (parent categories only)
      const totalCategories = await this.profCategoriesRepository
        .createQueryBuilder('pc')
        .where('pc.isActive = 1')
        .andWhere('pc.parentId IS NULL')
        .getCount();

      // Total profession users
      const totalProfessionUsersResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM profession_user',
      );
      const totalProfessionUsers = totalProfessionUsersResult[0]?.count || 0;

      // Verified profession users
      const verifiedProfessionUsersResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM profession_user WHERE is_verified = 1',
      );
      const verifiedProfessionUsers = verifiedProfessionUsersResult[0]?.count || 0;

      // Most popular professions
      const popularProfessions = await this.dataSource.query(`
        SELECT 
          p.id,
          ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} AS profession_name,
          COUNT(pu.user_id) AS users_count
        FROM prof_categories p
        LEFT JOIN profession_user pu ON pu.profession_id = p.id
        WHERE p.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY users_count DESC
        LIMIT 10
      `);

      // Categories with profession counts
      const categoriesWithCounts = await this.dataSource.query(`
        SELECT 
          pc.id,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} AS category_name,
          COUNT(p.id) AS professions_count
        FROM prof_categories pc
        LEFT JOIN prof_categories p ON p.parent_id = pc.id AND p.is_active = 1
        WHERE pc.is_active = 1
        GROUP BY pc.id, pc.name
        ORDER BY professions_count DESC
      `);

      return {
        succeeded: true,
        stats: {
          total_professions: totalProfessions,
          total_categories: totalCategories,
          total_profession_users: totalProfessionUsers,
          verified_profession_users: verifiedProfessionUsers,
          verification_rate:
            totalProfessionUsers > 0
              ? Math.round((verifiedProfessionUsers / totalProfessionUsers) * 100 * 100) / 100
              : 0,
        },
        popular_professions: popularProfessions,
        categories_with_counts: categoriesWithCounts,
      };
    } catch (error) {
      this.logger.error('Error in getProfessionStats:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get profession statistics');
    }
  }

  /**
   * Get profession suggestions based on user profile
   * Matches Yii actionGetProfessionSuggestions
   */
  async getProfessionSuggestions(
    userId: string,
    languageCode: string,
  ): Promise<any> {
    try {
      // Get user's current professions
      const userProfessionsResult = await this.dataSource.query(
        'SELECT profession_id FROM profession_user WHERE user_id = ?',
        [userId],
      );
      const userProfessions = userProfessionsResult.map((r: any) => r.profession_id);

      // Get popular professions that user doesn't have
      let suggestionsQuery = `
        SELECT 
          p.id,
          ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} AS profession_name,
          ${languageCode === 'ar' ? 'p.description_ar' : 'p.description'} AS profession_description,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} AS category_name,
          COUNT(pu.user_id) AS users_count,
          'Popular profession' AS suggestion_reason
        FROM prof_categories p
        LEFT JOIN profession_user pu ON pu.profession_id = p.id
        LEFT JOIN prof_categories pc ON pc.id = p.parent_id
        WHERE p.is_active = 1
      `;

      if (userProfessions.length > 0) {
        suggestionsQuery += ` AND p.id NOT IN (${userProfessions.map(() => '?').join(',')})`;
      }

      suggestionsQuery += `
        GROUP BY p.id, p.name
        ORDER BY users_count DESC
        LIMIT 10
      `;

      const suggestionsParams: any[] = userProfessions.length > 0 ? [...userProfessions] : [];
      const suggestions = await this.dataSource.query(suggestionsQuery, suggestionsParams);

      // Add icon URLs
      for (const suggestion of suggestions) {
        const attachment = await this.agAttachmentRepository.findOne({
          where: {
            tableName: '231',
            rowId: suggestion.id.toString(),
            type: 1,
          },
        });
        suggestion.icon_url = attachment
          ? this.toPublicUrl(attachment.filePath)
          : null;
      }

      return {
        succeeded: true,
        suggestions: suggestions,
      };
    } catch (error) {
      this.logger.error('Error in getProfessionSuggestions:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get profession suggestions');
    }
  }

  /**
   * Get profession trends (most added professions in recent period)
   * Matches Yii actionGetProfessionTrends
   */
  async getProfessionTrends(
    languageCode: string,
    dto: GetProfessionTrendsDto,
  ): Promise<any> {
    try {
      const period = dto.period || 30;
      const limit = dto.limit || 10;

      const trendingProfessions = await this.dataSource.query(`
        SELECT 
          p.id,
          ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} AS profession_name,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} AS category_name,
          COUNT(pu.id) AS recent_additions,
          (SELECT COUNT(*) FROM profession_user pu2 WHERE pu2.profession_id = p.id) AS total_users
        FROM prof_categories p
        LEFT JOIN profession_user pu ON pu.profession_id = p.id
        LEFT JOIN prof_categories pc ON pc.id = p.parent_id
        WHERE p.is_active = 1
          AND pu.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY p.id, p.name
        ORDER BY recent_additions DESC
        LIMIT ?
      `, [period, limit]);

      // Add icon URLs
      for (const trend of trendingProfessions) {
        const attachment = await this.agAttachmentRepository.findOne({
          where: {
            tableName: '231',
            rowId: trend.id.toString(),
            type: 1,
          },
        });
        trend.icon_url = attachment ? this.toPublicUrl(attachment.filePath) : null;
      }

      return {
        succeeded: true,
        trending_professions: trendingProfessions,
        period_days: period,
      };
    } catch (error) {
      this.logger.error('Error in getProfessionTrends:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get profession trends');
    }
  }
}
