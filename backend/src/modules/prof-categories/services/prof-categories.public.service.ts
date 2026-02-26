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
import { ProfCategoryEntity } from '../entities/prof-category.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  GetCategoriesDto,
  GetCategoryDto,
  ToggleTopSubcategoryDto,
  GetTopSubcategoriesDto,
  UploadCategoryImageDto,
  GetHierarchicalCategoriesDto,
} from '../dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Public ProfCategories service — handles all category endpoints matching Yii API
 */
@Injectable()
export class ProfCategoriesPublicService {
  private readonly baseHost: string;
  private readonly uploadsDir: string;

  constructor(
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
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
   * Build location condition for worker count query
   */
  private buildLocationCondition(
    userLat?: number,
    userLng?: number,
    radiusKm: number = 50,
  ): { condition: string; params: Record<string, any> } {
    if (userLat === null || userLat === undefined || userLng === null || userLng === undefined) {
      return { condition: '', params: {} };
    }

    const condition = `
      AND u.latitude IS NOT NULL 
      AND u.longitude IS NOT NULL
      AND (
        6371 * acos(
          cos(radians(:user_lat)) * cos(radians(u.latitude)) * 
          cos(radians(u.longitude) - radians(:user_lng)) + 
          sin(radians(:user_lat)) * sin(radians(u.latitude))
        )
      ) <= :radius_km
    `;

    return {
      condition,
      params: {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radiusKm,
      },
    };
  }

  /**
   * Get categories with subcategories (actionGetCategories)
   * Matches Yii implementation exactly
   */
  async getCategories(
    dto: GetCategoriesDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 10;
      const offset = (page - 1) * limit;
      const isWeb = dto.is_web || false;

      // Build location condition
      const location = this.buildLocationCondition(
        dto.latitude,
        dto.longitude,
        dto.radius_km || 50,
      );

      // Build worker count expression
      const workerCountExpression = `
        COALESCE((
          SELECT COUNT(DISTINCT u.id) 
          FROM users u 
          INNER JOIN profession_user up ON u.id = up.user_id
          WHERE up.profession_id = prof_categories.id            
          ${location.condition}
        ), 0) AS worker_count
      `;

      // Build base query for parent categories
      const baseQuery = this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          languageCode === 'ar'
            ? 'prof_categories.name_ar AS name'
            : 'prof_categories.name AS name',
          languageCode === 'ar'
            ? 'prof_categories.description_ar AS description'
            : 'prof_categories.description AS description',
          'prof_categories.sort_order',
          'prof_categories.icon_attachment_id',
          'prof_categories.is_active',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS icon_url`,
        ])
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin(
          'ag_attachment',
          'a',
          `a.id = (
            SELECT a2.id FROM ag_attachment a2 
            WHERE a2.row_id = prof_categories.id AND a2.table_name = 251 AND a2.type = 1 
            ORDER BY a2.created_at DESC LIMIT 1
          )`,
        )
        .where('prof_categories.parent_id IS NULL')
        .setParameter('base_host', this.baseHost);

      // Apply active filter if not web
      if (!isWeb) {
        baseQuery.andWhere('prof_categories.is_active = :isActive', { isActive: 1 });
      }

      // Get total count
      const countQuery = this.dataSource
        .createQueryBuilder()
        .from(ProfCategoryEntity, 'prof_categories')
        .where('prof_categories.parent_id IS NULL');

      if (!isWeb) {
        countQuery.andWhere('prof_categories.is_active = :isActive', { isActive: 1 });
      }

      const totalCount = await countQuery.getCount();

      // Get parent categories with pagination
      const parentCategories = await baseQuery
        .distinct()
        .orderBy('prof_categories.sort_order', 'ASC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Remove duplicates
      const seenIds: number[] = [];
      const uniqueCategories = parentCategories.filter((cat) => {
        if (seenIds.includes(cat.id)) {
          return false;
        }
        seenIds.push(cat.id);
        return true;
      });

      // Get subcategories for each parent category
      for (const category of uniqueCategories) {
        // Build worker count expression with location params
        const workerCountParams: Record<string, any> = {};
        if (Object.keys(location.params).length > 0) {
          Object.assign(workerCountParams, location.params);
        }

        const subQuery = this.dataSource
          .createQueryBuilder()
          .select([
            'prof_categories.id',
            languageCode === 'ar'
              ? 'prof_categories.name_ar AS name'
              : 'prof_categories.name AS name',
            languageCode === 'ar'
              ? 'prof_categories.description_ar AS description'
              : 'prof_categories.description AS description',
            'prof_categories.sort_order',
            'prof_categories.icon_attachment_id',
            'prof_categories.is_active',
            `CASE 
              WHEN a.file_path LIKE 'http%' THEN a.file_path
              ELSE CONCAT(:base_host, a.file_path)
            END AS icon_url`,
          ])
          .addSelect(
            `COALESCE((
              SELECT COUNT(DISTINCT u.id) 
              FROM users u 
              INNER JOIN profession_user up ON u.id = up.user_id
              WHERE up.profession_id = prof_categories.id            
              ${location.condition}
            ), 0)`,
            'worker_count',
          )
          .from(ProfCategoryEntity, 'prof_categories')
          .leftJoin(
            'ag_attachment',
            'a',
            `a.id = (
              SELECT a2.id FROM ag_attachment a2 
              WHERE a2.row_id = prof_categories.id AND a2.table_name = 251 AND a2.type = 1 
              ORDER BY a2.created_at DESC LIMIT 1
            )`,
          )
          .where('prof_categories.parent_id = :parentId', { parentId: category.id })
          .setParameter('base_host', this.baseHost);

        // Apply active filter to subcategories
        if (!isWeb) {
          subQuery.andWhere('prof_categories.is_active = :isActive', { isActive: 1 });
        }

        // Add location params if provided
        if (Object.keys(workerCountParams).length > 0) {
          Object.keys(workerCountParams).forEach((key) => {
            subQuery.setParameter(key, workerCountParams[key]);
          });
        }

        category.subcategories = await subQuery
          .groupBy('prof_categories.id')
          .orderBy('prof_categories.sort_order', 'ASC')
          .getRawMany();
      }

      // Get cities where show_hide = 1
      const cities = await this.dataSource
        .createQueryBuilder()
        .select([
          'id',
          languageCode === 'ar' ? 'city_name_ar AS city_name' : 'city_name',
          'province',
          'location',
          'longitude',
          'latitude',
          'area',
          'population',
          'elevation',
          languageCode === 'ar' ? 'definition_ar AS definition' : 'definition',
          languageCode === 'ar' ? 'address_ar AS address' : 'address_en AS address',
          'website_url',
          'phone_number',
          'email',
          'main_image',
        ])
        .from('cities', 'cities')
        .where('show_hide = :showHide', { showHide: 1 })
        .orderBy('city_name', 'ASC')
        .getRawMany();

      // Calculate total subcategories
      const totalSubcategories = uniqueCategories.reduce(
        (sum, cat) => sum + (cat.subcategories?.length || 0),
        0,
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        succeeded: true,
        data: {
          categories: uniqueCategories,
          cities: cities,
          total_categories: totalCount,
          returned_categories: uniqueCategories.length,
          total_subcategories: totalSubcategories,
          total_cities: cities.length,
        },
        pagination: {
          current_page: page,
          per_page: limit,
          total_count: totalCount,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
          next_page: page < totalPages ? page + 1 : null,
          prev_page: page > 1 ? page - 1 : null,
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          includes_subcategories: true,
          is_web: isWeb,
          active_filter: isWeb ? 'all' : 'active_only',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get categories: ' + error.message);
    }
  }

  /**
   * Get single category with subcategories (actionGetCategory)
   * Matches Yii implementation exactly
   */
  async getCategory(dto: GetCategoryDto, languageCode: string = 'en'): Promise<any> {
    try {
      const category = await this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          languageCode === 'ar'
            ? 'prof_categories.name_ar AS name'
            : 'prof_categories.name AS name',
          languageCode === 'ar'
            ? 'prof_categories.description_ar AS description'
            : 'prof_categories.description AS description',
          'prof_categories.sort_order',
          'prof_categories.icon_attachment_id',
          'prof_categories.is_active',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS icon_url`,
        ])
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin(
          'ag_attachment',
          'a',
          'a.row_id = prof_categories.id AND a.table_name = 251 AND a.type = 1',
        )
        .where('prof_categories.id = :categoryId', { categoryId: dto.category_id })
        .setParameter('base_host', this.baseHost)
        .getRawOne();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Get subcategories
      const subcategories = await this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          languageCode === 'ar'
            ? 'prof_categories.name_ar AS name'
            : 'prof_categories.name AS name',
          languageCode === 'ar'
            ? 'prof_categories.description_ar AS description'
            : 'prof_categories.description AS description',
          'prof_categories.sort_order',
          'prof_categories.icon_attachment_id',
          'prof_categories.is_active',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS icon_url`,
        ])
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin(
          'ag_attachment',
          'a',
          'a.row_id = prof_categories.id AND a.table_name = 251 AND a.type = 1',
        )
        .where('prof_categories.parent_id = :categoryId', { categoryId: dto.category_id })
        .groupBy('prof_categories.id')
        .orderBy('prof_categories.sort_order', 'ASC')
        .setParameter('base_host', this.baseHost)
        .getRawMany();

      // Get professions (same as subcategories for this category)
      const professions = subcategories;

      const totalSubcategories = subcategories.length;
      const totalProfessions = professions.length;

      category.subcategories = subcategories;
      category.professions = professions;
      category.is_parent = totalSubcategories > 0 ? 1 : 0;

      return {
        succeeded: true,
        data: {
          category: category,
          statistics: {
            subcategories_count: totalSubcategories,
            professions_count: totalProfessions,
          },
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          includes_subcategories: true,
          includes_professions: true,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get category: ' + error.message);
    }
  }

  /**
   * Toggle top subcategory (actionToggleTopSubcategory)
   * Matches Yii implementation exactly
   */
  async toggleTopSubcategory(dto: ToggleTopSubcategoryDto): Promise<any> {
    try {
      const subcategory = await this.profCategoriesRepository.findOne({
        where: { id: dto.subcategory_id },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      // Verify it's a subcategory (has parent_id)
      if (subcategory.parentId === null) {
        throw new BadRequestException('This is not a subcategory');
      }

      subcategory.isTop = dto.is_top;
      subcategory.updatedAt = new Date();

      await this.profCategoriesRepository.save(subcategory);

      return {
        succeeded: true,
        message: dto.is_top ? 'Subcategory marked as top' : 'Subcategory unmarked as top',
        data: {
          subcategory_id: dto.subcategory_id,
          is_top: dto.is_top,
          updated_at: subcategory.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to toggle top subcategory: ' + error.message,
      );
    }
  }

  /**
   * Get top subcategories (actionGetTopSubcategories)
   * Matches Yii implementation exactly
   */
  async getTopSubcategories(
    dto: GetTopSubcategoriesDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Build location condition
      const location = this.buildLocationCondition(
        dto.latitude,
        dto.longitude,
        dto.radius_km || 50,
      );

      const topSubcategories = await this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          'prof_categories.name',
          'prof_categories.name_ar',
          'prof_categories.description',
          'prof_categories.description_ar',
          'prof_categories.parent_id',
          'prof_categories.sort_order',
          'prof_categories.is_top',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, COALESCE(a.file_path, ''))
          END AS icon_url`,
        ])
        .addSelect(
          `COALESCE((
            SELECT COUNT(DISTINCT u.id) 
            FROM users u 
            INNER JOIN profession_user up ON u.id = up.user_id
            WHERE up.profession_id = prof_categories.id            
            ${location.condition}
          ), 0)`,
          'worker_count',
        )
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin(
          'ag_attachment',
          'a',
          `a.id = (
            SELECT a2.id FROM ag_attachment a2 
            WHERE a2.row_id = prof_categories.id 
            AND a2.table_name = 251 
            AND a2.type = 1 
            ORDER BY a2.created_at DESC 
            LIMIT 1
          )`,
        )
        .where('prof_categories.is_top = :isTop', { isTop: 1 })
        .setParameter('base_host', this.baseHost)
        .orderBy('prof_categories.sort_order', 'ASC');

      // Add location params if provided
      if (Object.keys(location.params).length > 0) {
        Object.keys(location.params).forEach((key) => {
          topSubcategories.setParameter(key, location.params[key]);
        });
      }

      const results = await topSubcategories.getRawMany();

      // Format subcategories
      const formattedSubcategories = results.map((subcategory) => ({
        id: subcategory.id,
        name:
          languageCode === 'ar'
            ? subcategory.name_ar || subcategory.name
            : subcategory.name,
        description:
          languageCode === 'ar'
            ? subcategory.description_ar || subcategory.description
            : subcategory.description,
        icon_url: subcategory.icon_url || null,
        is_top: subcategory.is_top,
        parent_id: subcategory.parent_id,
        worker_count: subcategory.worker_count ? parseInt(subcategory.worker_count) : 0,
      }));

      return {
        succeeded: true,
        data: {
          top_subcategories: formattedSubcategories,
          total_count: formattedSubcategories.length,
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get top subcategories: ' + error.message);
    }
  }

  /**
   * Upload category image (actionUploadCategoryImage)
   * Matches Yii implementation exactly
   */
  async uploadCategoryImage(
    dto: UploadCategoryImageDto,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const category = await this.profCategoriesRepository.findOne({
        where: { id: dto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (!file) {
        throw new BadRequestException('No image file uploaded');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type');
      }

      // Save the image
      const savedPath = await this.saveUploadedCategoryImage(
        file,
        dto.category_id,
        dto.type || 'category',
      );

      return {
        succeeded: true,
        message: 'Image uploaded successfully',
        data: {
          category_id: dto.category_id,
          image_url: savedPath,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload category image: ' + error.message);
    }
  }

  /**
   * Save uploaded category image
   */
  private async saveUploadedCategoryImage(
    file: Express.Multer.File,
    categoryId: number,
    type: string = 'category',
  ): Promise<string> {
    const uploadDir = path.join(this.uploadsDir, 'categories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const filename = `category_${type}_${categoryId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const webPath = `${this.baseHost.replace(/\/+$/, '')}/uploads/categories/${filename}`;

    // Save to database (ag_attachment table)
    await this.dataSource.query(
      `INSERT INTO ag_attachment (table_name, row_id, type, file_path, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ['251', String(categoryId), '1', webPath, String(file.size)],
    );

    return webPath;
  }

  /**
   * Get hierarchical categories (actionGetHierarchicalCategories)
   * Matches Yii implementation exactly
   */
  async getHierarchicalCategories(
    dto: GetHierarchicalCategoriesDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Get the main category
      const mainCategory = await this.dataSource
        .createQueryBuilder()
        .select([
          'prof_categories.id',
          languageCode === 'ar'
            ? 'prof_categories.name_ar AS name'
            : 'prof_categories.name AS name',
          languageCode === 'ar'
            ? 'prof_categories.description_ar AS description'
            : 'prof_categories.description AS description',
          'prof_categories.sort_order',
          'prof_categories.icon_attachment_id',
          'prof_categories.is_active',
          `CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(:base_host, a.file_path)
          END AS icon_url`,
        ])
        .from(ProfCategoryEntity, 'prof_categories')
        .leftJoin(
          'ag_attachment',
          'a',
          `a.id = (
            SELECT a2.id FROM ag_attachment a2 
            WHERE a2.row_id = prof_categories.id AND a2.table_name = 251 AND a2.type = 1 
            ORDER BY a2.created_at DESC LIMIT 1
          )`,
        )
        .where('prof_categories.id = :categoryId AND prof_categories.is_active = :isActive', {
          categoryId: dto.category_id,
          isActive: 1,
        })
        .setParameter('base_host', this.baseHost)
        .getRawOne();

      if (!mainCategory) {
        throw new NotFoundException('Category not found');
      }

      // Recursive function to get subcategories
      const getSubcategories = async (parentId: number): Promise<any[]> => {
        const subcategories = await this.dataSource
          .createQueryBuilder()
          .select([
            'prof_categories.id',
            languageCode === 'ar'
              ? 'prof_categories.name_ar AS name'
              : 'prof_categories.name AS name',
            languageCode === 'ar'
              ? 'prof_categories.description_ar AS description'
              : 'prof_categories.description AS description',
            'prof_categories.sort_order',
            'prof_categories.icon_attachment_id',
            'prof_categories.is_active',
            'prof_categories.parent_id',
            `CASE 
              WHEN a.file_path LIKE 'http%' THEN a.file_path
              ELSE CONCAT(:base_host, a.file_path)
            END AS icon_url`,
          ])
          .from(ProfCategoryEntity, 'prof_categories')
          .leftJoin(
            'ag_attachment',
            'a',
            `a.id = (
              SELECT a2.id FROM ag_attachment a2 
              WHERE a2.row_id = prof_categories.id AND a2.table_name = 251 AND a2.type = 1 
              ORDER BY a2.created_at DESC LIMIT 1
            )`,
          )
          .where(
            'prof_categories.parent_id = :parentId AND prof_categories.is_active = :isActive',
            { parentId, isActive: 1 },
          )
          .orderBy('prof_categories.sort_order', 'ASC')
          .setParameter('base_host', this.baseHost)
          .getRawMany();

        // Recursively get subcategories for each subcategory
        for (const subcategory of subcategories) {
          subcategory.subcategories = await getSubcategories(subcategory.id);
        }

        return subcategories;
      };

      // Get all subcategories recursively
      mainCategory.subcategories = await getSubcategories(dto.category_id);

      // Count total subcategories recursively
      const countSubcategories = (subcategories: any[]): number => {
        let count = subcategories.length;
        for (const subcategory of subcategories) {
          if (subcategory.subcategories && Array.isArray(subcategory.subcategories)) {
            count += countSubcategories(subcategory.subcategories);
          }
        }
        return count;
      };

      const totalSubcategories = countSubcategories(mainCategory.subcategories || []);

      // Calculate hierarchy depth
      const calculateDepth = (subcategories: any[]): number => {
        if (!subcategories || subcategories.length === 0) {
          return 0;
        }

        let maxDepth = 0;
        for (const subcategory of subcategories) {
          let currentDepth = 1;
          if (subcategory.subcategories && Array.isArray(subcategory.subcategories)) {
            currentDepth += calculateDepth(subcategory.subcategories);
          }
          maxDepth = Math.max(maxDepth, currentDepth);
        }
        return maxDepth;
      };

      const hierarchyDepth = calculateDepth(mainCategory.subcategories || []);

      return {
        succeeded: true,
        data: {
          category: mainCategory,
          hierarchy_statistics: {
            total_subcategories: totalSubcategories,
            hierarchy_depth: hierarchyDepth,
          },
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          hierarchical_fetch: true,
          includes_all_subcategories: true,
          includes_all_professions: true,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get hierarchical categories: ' + error.message,
      );
    }
  }
}
