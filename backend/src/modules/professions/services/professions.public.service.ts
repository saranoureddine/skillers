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
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { GetProfessionsDto } from '../dto/get-professions.dto';
import { GetProfessionDto } from '../dto/get-profession.dto';
import { CreateProfessionDto } from '../dto/create-profession.dto';
import { UpdateProfessionDto } from '../dto/update-profession.dto';
import { DeleteProfessionDto } from '../dto/delete-profession.dto';
import { GetProfessionsByCategoryDto } from '../dto/get-professions-by-category.dto';
import { SaveOrderDto } from '../dto/save-order.dto';
import { ProfessionsService } from './professions.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfessionsPublicService {
  private readonly baseHost: string;
  private readonly ATTACH_TABLE = 252; // Prof categories table ID
  private readonly ATTACH_TYPE = 1; // Main image type

  constructor(
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly professionsService: ProfessionsService,
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
   * Determine if the request is from mobile platform
   */
  private isMobilePlatform(userAgent: string, platform: string): boolean {
    // Check custom header first
    if (platform) {
      return platform.toLowerCase() === 'mobile';
    }

    // Check User-Agent for mobile indicators
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const userAgentLower = userAgent.toLowerCase();

    for (const keyword of mobileKeywords) {
      if (userAgentLower.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Build icon URL
   */
  private buildIconUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${this.baseHost}/${filePath.replace(/^\/+/, '')}`;
  }

  /**
   * Get all professions with optional filtering
   */
  async getProfessions(
    dto: GetProfessionsDto,
    languageCode: string = 'en',
    userAgent: string = '',
    platform: string = '',
  ): Promise<any> {
    try {
      const isMobile = this.isMobilePlatform(userAgent, platform);
      const { categoryId, search, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Build query
      let query = this.profCategoriesRepository
        .createQueryBuilder('pc')
        .select([
          'pc.id',
          languageCode === 'ar' ? 'pc.nameAr as name' : 'pc.name',
          languageCode === 'ar' ? 'pc.descriptionAr as description' : 'pc.description',
          'pc.parentId as category_id',
          'pc.sortOrder as sort_order',
          'pc.iconAttachmentId as icon_attachment_id',
          'pc.isActive as is_active',
        ])
        .addSelect(
          languageCode === 'ar' ? 'parent.nameAr as category_name' : 'parent.name',
          'category_name',
        )
        .leftJoin('prof_categories', 'parent', 'parent.id = pc.parentId')
        .where('pc.parentId IS NOT NULL');

      // Apply active filter based on platform
      if (isMobile) {
        query = query.andWhere('pc.isActive = :isActive', { isActive: 1 });
      }

      // Apply category filter
      if (categoryId) {
        query = query.andWhere('pc.parentId = :categoryId', { categoryId });
      }

      // Apply search filter
      if (search) {
        query = query.andWhere(
          '(pc.name LIKE :search OR pc.nameAr LIKE :search OR pc.description LIKE :search OR pc.descriptionAr LIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Get total count
      const totalCount = await query.getCount();

      // Apply pagination and ordering
      const professions = await query
        .orderBy('pc.parentId', 'ASC')
        .addOrderBy('pc.sortOrder', 'ASC')
        .addOrderBy('pc.name', 'ASC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      // Get icon URLs for each profession
      const professionIds = professions.map((p: any) => p.pc_id || p.id);
      const icons =
        professionIds.length > 0
          ? await this.dataSource.query(
              `SELECT row_id, file_path FROM ag_attachment 
               WHERE table_name = ? AND type = ? AND row_id IN (${professionIds.map(() => '?').join(',')})`,
              [this.ATTACH_TABLE, this.ATTACH_TYPE, ...professionIds],
            )
          : [];

      const iconMap = new Map<number, string>(icons.map((icon: any) => [icon.row_id, icon.file_path]));

      // Format professions with icon URLs
      const formattedProfessions = professions.map((prof: any) => {
        const iconPath = iconMap.get(prof.pc_id || prof.id);
        return {
          id: prof.pc_id || prof.id,
          name: prof.name,
          description: prof.description,
          category_id: prof.category_id || prof.pc_parentId,
          sort_order: prof.sort_order,
          icon_attachment_id: prof.icon_attachment_id,
          is_active: prof.is_active,
          category_name: prof.category_name,
          icon_url: this.buildIconUrl(iconPath || null),
        };
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        succeeded: true,
        data: {
          professions: formattedProfessions,
          total_count: totalCount,
          returned_count: formattedProfessions.length,
          filters_applied: {
            category_id: categoryId || null,
            search_term: search || null,
          },
        },
        pagination: {
          current_page: page,
          per_page: limit,
          total_pages: totalPages,
          total_count: totalCount,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? page + 1 : null,
          prev_page: hasPrevPage ? page - 1 : null,
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          platform: isMobile ? 'mobile' : 'web',
          active_filter: isMobile ? 'active_only' : 'all',
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve professions');
    }
  }

  /**
   * Get a specific profession with details
   */
  async getProfession(dto: GetProfessionDto, languageCode: string = 'en'): Promise<any> {
    try {
      const { professionId } = dto;

      const profession = await this.profCategoriesRepository
        .createQueryBuilder('pc')
        .select([
          'pc.id',
          languageCode === 'ar' ? 'pc.nameAr as name' : 'pc.name',
          languageCode === 'ar' ? 'pc.descriptionAr as description' : 'pc.description',
          'pc.parentId as category_id',
          'pc.sortOrder as sort_order',
          'pc.iconAttachmentId as icon_attachment_id',
          languageCode === 'ar' ? 'parent.nameAr as category_name' : 'parent.name',
          languageCode === 'ar' ? 'parent.descriptionAr as category_description' : 'parent.description',
        ])
        .leftJoin('prof_categories', 'parent', 'parent.id = pc.parentId')
        .where('pc.id = :professionId', { professionId })
        .andWhere('pc.isActive = :isActive', { isActive: 1 })
        .andWhere('pc.parentId IS NOT NULL')
        .getRawOne();

      if (!profession) {
        throw new NotFoundException('Profession not found');
      }

      // Get icon URL
      const icon = await this.dataSource.query(
        'SELECT file_path FROM ag_attachment WHERE table_name = ? AND type = ? AND row_id = ? LIMIT 1',
        [this.ATTACH_TABLE, this.ATTACH_TYPE, professionId],
      );

      profession.icon_url = this.buildIconUrl(icon[0]?.file_path || null);

      // Get users with this profession
      const users = await this.dataSource.query(
        `SELECT 
          profession_user.id,
          profession_user.user_id,
          profession_user.is_primary,
          profession_user.experience_years,
          profession_user.is_verified,
          profession_user.verified_at,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image
        FROM profession_user
        LEFT JOIN users u ON u.id = profession_user.user_id
        WHERE profession_user.profession_id = ? AND u.is_activated = 1`,
        [this.baseHost, professionId],
      );

      profession.users = users;

      // Calculate user statistics
      const totalUsers = users.length;
      const verifiedUsers = users.filter((u: any) => u.is_verified === 1).length;
      const primaryUsers = users.filter((u: any) => u.is_primary === 1).length;

      return {
        succeeded: true,
        data: {
          profession,
          statistics: {
            total_users: totalUsers,
            verified_users: verifiedUsers,
            primary_users: primaryUsers,
            verification_rate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100 * 100) / 100 : 0,
          },
        },
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          category_info: {
            category_id: profession.category_id,
            category_name: profession.category_name,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve profession');
    }
  }

  /**
   * Create a new profession
   */
  async createProfession(dto: CreateProfessionDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const profession = this.profCategoriesRepository.create({
        name: dto.name,
        nameAr: dto.nameAr || null,
        description: dto.description || null,
        descriptionAr: dto.descriptionAr || null,
        parentId: dto.categoryId || null,
        isActive: 1,
        sortOrder: dto.sortOrder || 0,
        iconAttachmentId: dto.iconAttachmentId || null,
        createdBy: userId,
      });

      const saved = await this.profCategoriesRepository.save(profession);

      return {
        succeeded: true,
        message: 'Profession created successfully',
        profession_id: saved.id,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create profession');
    }
  }

  /**
   * Update a profession
   */
  async updateProfession(dto: UpdateProfessionDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      if (!dto.professionId) {
        throw new BadRequestException('Profession ID is required');
      }

      const profession = await this.profCategoriesRepository.findOne({
        where: { id: dto.professionId },
      });

      if (!profession) {
        throw new NotFoundException('Profession not found');
      }

      // Update fields
      if (dto.name !== undefined) profession.name = dto.name;
      if (dto.nameAr !== undefined) profession.nameAr = dto.nameAr;
      if (dto.description !== undefined) profession.description = dto.description;
      if (dto.descriptionAr !== undefined) profession.descriptionAr = dto.descriptionAr;
      if (dto.categoryId !== undefined) profession.parentId = dto.categoryId;
      if (dto.isActive !== undefined) profession.isActive = dto.isActive;
      if (dto.sortOrder !== undefined) profession.sortOrder = dto.sortOrder;
      if (dto.iconAttachmentId !== undefined) profession.iconAttachmentId = dto.iconAttachmentId;
      profession.updatedBy = userId;

      await this.profCategoriesRepository.save(profession);

      return {
        succeeded: true,
        message: 'Profession updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profession');
    }
  }

  /**
   * Delete a profession
   */
  async deleteProfession(dto: DeleteProfessionDto, languageCode: string = 'en'): Promise<any> {
    try {
      const { professionId } = dto;

      const profession = await this.profCategoriesRepository.findOne({
        where: { id: professionId },
      });

      if (!profession) {
        throw new NotFoundException('Profession not found');
      }

      // Check if profession has users
      const usersCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM profession_user WHERE profession_id = ?',
        [professionId],
      );

      if (usersCount[0]?.count > 0) {
        throw new ConflictException('Cannot delete profession with associated users');
      }

      await this.profCategoriesRepository.remove(profession);

      return {
        succeeded: true,
        message: 'Profession deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete profession');
    }
  }

  /**
   * Get professions by category (hierarchical)
   */
  async getProfessionsByCategory(
    dto: GetProfessionsByCategoryDto,
    languageCode: string = 'en',
    userAgent: string = '',
    platform: string = '',
  ): Promise<any> {
    try {
      const { categoryId } = dto;
      const isMobile = this.isMobilePlatform(userAgent, platform);

      // Get all category IDs in hierarchy
      const allCategoryIds = await this.professionsService.getAllCategoryIdsInHierarchy(categoryId);

      if (allCategoryIds.length === 0) {
        // Check if categoryId itself is a profession
        const isProfession = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM prof_categories WHERE id = ? AND parent_id IS NOT NULL',
          [categoryId],
        );

        if (isProfession[0]?.count === 0) {
          return {
            succeeded: true,
            data: {
              professions: [],
              hierarchy_info: {
                main_category_id: categoryId,
                categories_included: [],
                category_names: [],
                total_categories: 0,
              },
            },
            metadata: {
              total_professions: 0,
              language: languageCode,
              retrieved_at: new Date().toISOString(),
              api_version: '2.0.0',
              hierarchical_search: true,
              platform: isMobile ? 'mobile' : 'web',
              active_filter: isMobile ? 'active_only' : 'all',
            },
          };
        } else {
          allCategoryIds.push(categoryId);
        }
      }

      // Build query
      let query = this.profCategoriesRepository
        .createQueryBuilder('pc')
        .select([
          'pc.id',
          'pc.name',
          'pc.nameAr',
          'pc.description',
          'pc.descriptionAr',
          languageCode === 'ar' ? 'pc.nameAr as name' : 'pc.name',
          languageCode === 'ar' ? 'pc.descriptionAr as description' : 'pc.description',
          'pc.parentId',
          'pc.sortOrder as sort_order',
          'pc.iconAttachmentId as icon_attachment_id',
          'pc.isActive as is_active',
          languageCode === 'ar' ? 'parent.nameAr as category_name' : 'parent.name',
        ])
        .leftJoin('prof_categories', 'parent', 'parent.id = pc.parentId')
        .where('pc.id IN (:...ids)', { ids: allCategoryIds });

      // Apply active filter based on platform
      if (isMobile) {
        query = query.andWhere('pc.isActive = :isActive', { isActive: 1 }).andWhere('pc.parentId IS NOT NULL');
      }

      const professions = await query
        .orderBy('pc.parentId', 'ASC')
        .addOrderBy('pc.sortOrder', 'ASC')
        .addOrderBy('pc.name', 'ASC')
        .getRawMany();

      // Get icon URLs
      const professionIds = professions.map((p: any) => p.pc_id);
      const icons = await this.dataSource.query(
        `SELECT row_id, file_path FROM ag_attachment 
         WHERE table_name = ? AND type = ? AND row_id IN (${professionIds.map(() => '?').join(',')})`,
        [this.ATTACH_TABLE, this.ATTACH_TYPE, ...professionIds],
      );

      const iconMap = new Map<number, string>(icons.map((icon: any) => [icon.row_id, icon.file_path]));

      // Format professions and get users
      const formattedProfessions = await Promise.all(
        professions.map(async (prof: any) => {
          const users = await this.dataSource.query(
            `SELECT 
              profession_user.id,
              profession_user.user_id,
              profession_user.is_primary,
              profession_user.experience_years,
              profession_user.is_verified,
              profession_user.verified_at,
              u.first_name,
              u.last_name,
              u.email,
              u.phone_number,
              u.bio,
              u.followers_count,
              u.following_count,
              u.average_rating,
              u.total_ratings,
              cities.city_name,
              cities.city_name_ar,
              CASE 
                WHEN u.main_image LIKE 'http%' THEN u.main_image
                ELSE CONCAT(?, u.main_image)
              END AS main_image
            FROM profession_user
            LEFT JOIN users u ON u.id = profession_user.user_id
            LEFT JOIN user_cities uc ON uc.user_id = u.id
            LEFT JOIN cities ON cities.id = uc.city_id
            WHERE profession_user.profession_id = ? AND u.is_activated = 1`,
            [this.baseHost, prof.pc_id],
          );

          // Localize city names
          users.forEach((user: any) => {
            user.city_name = languageCode === 'ar' ? user.city_name_ar : user.city_name;
            delete user.city_name_ar;
          });

          // Calculate statistics
          const totalUsers = users.length;
          const verifiedUsers = users.filter((u: any) => u.is_verified === 1).length;
          const primaryUsers = users.filter((u: any) => u.is_primary === 1).length;

          const iconPath = iconMap.get(prof.pc_id);
          return {
            id: prof.pc_id,
            name: prof.name,
            description: prof.description,
            category_id: prof.pc_parentId,
            sort_order: prof.sort_order,
            icon_attachment_id: prof.icon_attachment_id,
            is_active: prof.is_active,
            category_name: prof.category_name,
            icon_url: this.buildIconUrl(iconPath || null),
            users,
            users_count: totalUsers,
            verified_users_count: verifiedUsers,
            primary_users_count: primaryUsers,
            verification_rate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100 * 100) / 100 : 0,
          };
        }),
      );

      // Calculate hierarchy metadata
      const categoriesIncluded = [...new Set(formattedProfessions.map((p) => p.category_id))];
      const categoryNames = [...new Set(formattedProfessions.map((p) => p.category_name))];

      return {
        succeeded: true,
        data: {
          professions: formattedProfessions,
          hierarchy_info: {
            main_category_id: categoryId,
            categories_included: categoriesIncluded,
            category_names: categoryNames,
            total_categories: categoriesIncluded.length,
          },
        },
        metadata: {
          total_professions: formattedProfessions.length,
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          api_version: '2.0.0',
          hierarchical_search: true,
          platform: isMobile ? 'mobile' : 'web',
          active_filter: isMobile ? 'active_only' : 'all',
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve professions by category');
    }
  }

  /**
   * Save order for professions
   */
  async saveOrder(dto: SaveOrderDto, userId: string, languageCode: string = 'en'): Promise<any> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const updatedProfessions: any[] = [];

        for (const item of dto.orderList) {
          const profession = await queryRunner.manager.findOne(ProfCategoryEntity, {
            where: { id: item.id },
          });

          if (!profession) {
            throw new NotFoundException(`Profession not found: ${item.id}`);
          }

          profession.sortOrder = item.sortOrder;
          profession.updatedBy = userId;

          await queryRunner.manager.save(profession);

          updatedProfessions.push({
            id: profession.id,
            name: profession.name,
            name_ar: profession.nameAr,
            category_id: profession.parentId,
            sort_order: profession.sortOrder,
          });
        }

        await queryRunner.commitTransaction();

        return {
          succeeded: true,
          message: 'Order saved successfully',
          updated_professions: updatedProfessions,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to save order');
    }
  }
}
