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
import { ProfessionUserEntity } from '../entities/profession-user.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';
import { GetUserProfessionsDto } from '../dto/get-user-professions.dto';
import { AddUserProfessionDto } from '../dto/add-user-profession.dto';
import { UpdateUserProfessionDto } from '../dto/update-user-profession.dto';
import { UpdateUserProfessionAdminDto } from '../dto/update-user-profession-admin.dto';
import { RemoveUserProfessionDto } from '../dto/remove-user-profession.dto';
import { DeleteUserProfessionAdminDto } from '../dto/delete-user-profession-admin.dto';
import { SetPrimaryProfessionDto } from '../dto/set-primary-profession.dto';
import { GetUsersByProfessionDto } from '../dto/get-users-by-profession.dto';
import { GetUserProfessionSummaryDto } from '../dto/get-user-profession-summary.dto';
import { GetAllProfessionUsersDto } from '../dto/get-all-profession-users.dto';
import { GetRecommendedProfessionsDto } from '../dto/get-recommended-professions.dto';
import { GetNearbyProfessionalsDto } from '../dto/get-nearby-professionals.dto';
import { GetUserProfileDto } from '../dto/get-user-profile.dto';
import { GetAllUsersWithProfessionsDto } from '../dto/get-all-users-with-professions.dto';
import { GetAllProfessionalsDto } from '../dto/get-all-professionals.dto';
import { GetTopSpecialistsDto } from '../dto/get-top-specialists.dto';
import { ProfessionUserService } from './profession-user.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfessionUserPublicService {
  private readonly baseHost: string;
  private readonly MAX_PROFESSIONS = 5;
  private readonly ATTACH_TABLE_PROF = 252;
  private readonly ATTACH_TYPE = 1;
  private readonly ATTACH_TABLE_USERS = 210;
  private readonly ATTACH_TABLE_POSTS = 253;

  constructor(
    @InjectRepository(ProfessionUserEntity)
    private readonly professionUserRepository: Repository<ProfessionUserEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    private readonly dataSource: DataSource,
    private readonly professionUserService: ProfessionUserService,
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
    if (platform) {
      return platform.toLowerCase() === 'mobile';
    }
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
   * Build image URL
   */
  private buildImageUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${this.baseHost}/${filePath.replace(/^\/+/, '')}`;
  }

  /**
   * Get user's professions
   */
  async getUserProfessions(
    dto: GetUserProfessionsDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.userId || currentUserId;

      const userProfessions = await this.dataSource.query(
        `SELECT 
          pu.id,
          pu.profession_id,
          pu.is_primary,
          pu.experience_years,
          pu.is_verified,
          CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
          CONVERT_TZ(pu.created_at, '+00:00', '+03:00') as created_at,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as name,
          ${languageCode === 'ar' ? 'pc.description_ar' : 'pc.description'} as description,
          ${languageCode === 'ar' ? 'parent_pc.name_ar' : 'parent_pc.name'} as category_name,
          parent_pc.id as category_id,
          CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(?, a.file_path)
          END AS profession_icon
        FROM profession_user pu
        LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
        LEFT JOIN prof_categories parent_pc ON parent_pc.id = pc.parent_id
        LEFT JOIN ag_attachment a ON a.row_id = pc.id AND a.table_name = ? AND a.type = ?
        WHERE pu.user_id = ? AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
        ORDER BY pu.is_primary DESC, pu.created_at ASC`,
        [this.baseHost, this.ATTACH_TABLE_PROF, this.ATTACH_TYPE, targetUserId]
      );

      return {
        succeeded: true,
        professions: userProfessions,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user professions');
    }
  }

  /**
   * Add professions to user with profile updates
   */
  async addUserProfession(
    dto: AddUserProfessionDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetUserId = dto.userId || currentUserId;

      // Check current profession count
      const currentCount = await this.professionUserService.getUserProfessionCount(targetUserId);
      const totalAfterAdd = currentCount + dto.professions.length;

      if (totalAfterAdd > this.MAX_PROFESSIONS) {
        throw new BadRequestException(
          `Maximum ${this.MAX_PROFESSIONS} professions allowed. You currently have ${currentCount} professions and trying to add ${dto.professions.length} more.`
        );
      }

      // Validate each profession
      const validProfessions: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < dto.professions.length; i++) {
        const prof = dto.professions[i];
        const profession = await this.profCategoriesRepository.findOne({
          where: { id: prof.professionId, isActive: 1 },
        });

        if (!profession || profession.parentId === null) {
          errors.push(`Profession not found or is a category for ID ${prof.professionId} (index ${i})`);
          continue;
        }

        const existing = await this.professionUserService.findByUserAndProfession(targetUserId, prof.professionId);
        if (existing) {
          errors.push(`User already has profession ID ${prof.professionId} (index ${i})`);
          continue;
        }

        validProfessions.push(prof);
      }

      if (errors.length > 0) {
        throw new BadRequestException({ message: 'Validation errors', errors, validProfessionsCount: validProfessions.length });
      }

      if (validProfessions.length === 0) {
        throw new BadRequestException('No valid professions to add');
      }

      // Add professions
      const addedProfessions: any[] = [];
      for (const prof of validProfessions) {
        const professionUser = this.professionUserRepository.create({
          userId: targetUserId,
          professionId: prof.professionId,
          isPrimary: prof.isPrimary || 0,
          experienceYears: prof.experienceYears || null,
          isVerified: 0,
        });

        // If setting as primary, unset others
        if (prof.isPrimary === 1) {
          await queryRunner.manager.update(
            ProfessionUserEntity,
            { userId: targetUserId },
            { isPrimary: 0 }
          );
        }

        const saved = await queryRunner.manager.save(professionUser);
        addedProfessions.push({
          profession_user_id: saved.id,
          profession_id: saved.professionId,
          experience_years: saved.experienceYears,
          is_primary: saved.isPrimary,
        });
      }

      // Update user profile
      const user = await queryRunner.manager.findOne(UserEntity, { where: { id: targetUserId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let userUpdated = false;
      const updatedFields: string[] = [];

      if (dto.location !== undefined) {
        user.location = dto.location;
        userUpdated = true;
        updatedFields.push('location');
      }

      if (dto.spokenLanguage !== undefined) {
        const languagesValue = typeof dto.spokenLanguage === 'string' 
          ? dto.spokenLanguage 
          : JSON.stringify(dto.spokenLanguage);
        user.languages = languagesValue;
        userUpdated = true;
        updatedFields.push('languages');
      }

      if (dto.bio !== undefined) {
        user.bio = dto.bio;
        userUpdated = true;
        updatedFields.push('bio');
      }

      if (dto.pdfCv !== undefined) {
        const cvValue = typeof dto.pdfCv === 'string' ? dto.pdfCv : JSON.stringify(dto.pdfCv);
        user.cv = cvValue;
        userUpdated = true;
        updatedFields.push('cv');
      }

      if (dto.coverVideoGuidelines !== undefined) {
        const guidelinesValue = typeof dto.coverVideoGuidelines === 'string' 
          ? dto.coverVideoGuidelines 
          : JSON.stringify(dto.coverVideoGuidelines);
        user.coverImage = guidelinesValue; // Assuming this field stores guidelines
        userUpdated = true;
        updatedFields.push('coverVideoGuidelines');
      }

      if (userUpdated) {
        await queryRunner.manager.save(user);
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Professions added successfully',
        added_professions: addedProfessions,
        total_added: addedProfessions.length,
        user_updated: userUpdated,
        updated_fields: updatedFields,
        target_user_id: targetUserId,
        is_admin_action: !!dto.userId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add user profession');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update user profession
   */
  async updateUserProfession(
    dto: UpdateUserProfessionDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const professionUser = await this.professionUserService.findById(dto.professionUserId);

      if (professionUser.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      if (dto.isPrimary !== undefined) {
        professionUser.isPrimary = dto.isPrimary;
        // If setting as primary, unset others
        if (dto.isPrimary === 1) {
          await this.dataSource.query(
            'UPDATE profession_user SET is_primary = 0 WHERE user_id = ? AND id != ?',
            [userId, dto.professionUserId]
          );
        }
      }

      if (dto.experienceYears !== undefined) {
        professionUser.experienceYears = dto.experienceYears;
      }

      await this.professionUserRepository.save(professionUser);

      return {
        succeeded: true,
        message: 'Profession updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user profession');
    }
  }

  /**
   * Remove profession from user
   */
  async removeUserProfession(
    dto: RemoveUserProfessionDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const professionUser = await this.professionUserService.findById(dto.professionUserId);

      if (professionUser.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      await this.professionUserRepository.remove(professionUser);

      return {
        succeeded: true,
        message: 'Profession removed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove user profession');
    }
  }

  /**
   * Set primary profession
   */
  async setPrimaryProfession(
    dto: SetPrimaryProfessionDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const professionUser = await this.professionUserService.findById(dto.professionUserId);

      if (professionUser.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Unset all other primary professions
      await this.dataSource.query(
        'UPDATE profession_user SET is_primary = 0 WHERE user_id = ?',
        [userId]
      );

      // Set this one as primary
      professionUser.isPrimary = 1;
      await this.professionUserRepository.save(professionUser);

      return {
        succeeded: true,
        message: 'Primary profession set successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set primary profession');
    }
  }

  /**
   * Get users by profession
   */
  async getUsersByProfession(
    dto: GetUsersByProfessionDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { professionId, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      const users = await this.dataSource.query(
        `SELECT 
          pu.id,
          pu.user_id,
          pu.is_primary,
          pu.experience_years,
          pu.is_verified,
          CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image
        FROM profession_user pu
        LEFT JOIN users u ON u.id = pu.user_id
        WHERE pu.profession_id = ? AND u.is_activated = 1
        ORDER BY pu.is_primary DESC, pu.created_at ASC
        LIMIT ? OFFSET ?`,
        [this.baseHost, professionId, limit, offset]
      );

      const totalResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM profession_user pu LEFT JOIN users u ON u.id = pu.user_id WHERE pu.profession_id = ? AND u.is_activated = 1',
        [professionId]
      );
      const totalCount = totalResult[0]?.count || 0;

      return {
        succeeded: true,
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get users by profession');
    }
  }

  /**
   * Get user profession summary
   */
  async getUserProfessionSummary(
    dto: GetUserProfessionSummaryDto,
    currentUserId: string,
    languageCode: string = 'en',
    userAgent: string = '',
    platform: string = '',
  ): Promise<any> {
    try {
      const targetUserId = dto.userId || currentUserId;
      const isMobile = this.isMobilePlatform(userAgent, platform);

      const userProfessions = await this.dataSource.query(
        `SELECT 
          pu.id,
          pu.profession_id,
          pu.is_primary,
          pu.experience_years,
          pu.is_verified,
          CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
          CONVERT_TZ(pu.created_at, '+00:00', '+03:00') as created_at,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as name,
          ${languageCode === 'ar' ? 'parent_pc.name_ar' : 'parent_pc.name'} as category_name,
          CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(?, a.file_path)
          END AS profession_icon
        FROM profession_user pu
        LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
        LEFT JOIN prof_categories parent_pc ON parent_pc.id = pc.parent_id
        LEFT JOIN ag_attachment a ON a.row_id = pc.id AND a.table_name = ? AND a.type = ?
        WHERE pu.user_id = ? AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
        ORDER BY pu.is_primary DESC, pu.created_at ASC`,
        [this.baseHost, this.ATTACH_TABLE_PROF, this.ATTACH_TYPE, targetUserId]
      );

      const totalProfessions = userProfessions.length;
      const verifiedProfessions = userProfessions.filter((p: any) => p.is_verified === 1).length;
      const primaryProfession = userProfessions.find((p: any) => p.is_primary === 1) || null;
      const totalExperience = userProfessions.reduce((sum: number, p: any) => sum + (p.experience_years || 0), 0);
      const categories = [...new Set(userProfessions.map((p: any) => p.category_name))];

      return {
        succeeded: true,
        summary: {
          total_professions: totalProfessions,
          verified_professions: verifiedProfessions,
          verification_rate: totalProfessions > 0 ? Math.round((verifiedProfessions / totalProfessions) * 100 * 100) / 100 : 0,
          primary_profession: primaryProfession,
          total_experience_years: totalExperience,
          categories_count: categories.length,
          categories: categories,
        },
        professions: userProfessions,
        metadata: {
          platform: isMobile ? 'mobile' : 'web',
          language: languageCode,
          retrieved_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user profession summary');
    }
  }

  /**
   * Get all profession users with admin filters
   */
  async getAllProfessionUsers(
    dto: GetAllProfessionUsersDto,
    languageCode: string = 'en',
    userAgent: string = '',
    platform: string = '',
  ): Promise<any> {
    try {
      const { professionId, categoryId, isVerified, search, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;
      const isMobile = this.isMobilePlatform(userAgent, platform);

      let query = `
        SELECT 
          pu.id,
          pu.user_id,
          pu.profession_id,
          pu.is_primary,
          pu.experience_years,
          pu.is_verified,
          CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
          pu.verified_by,
          CONVERT_TZ(pu.created_at, '+00:00', '+03:00') as created_at,
          CONVERT_TZ(pu.updated_at, '+00:00', '+03:00') as updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.country_code,
          u.phone_number,
          u.is_activated,
          u.is_guest,
          u.gender,
          u.birth_date,
          u.address,
          u.city_id,
          u.province_id,
          u.center_num,
          u.registration_method,
          u.user_work,
          u.languages,
          u.bio,
          u.website,
          u.location,
          u.latitude,
          u.longitude,
          u.followers_count,
          u.following_count,
          u.average_rating,
          u.total_ratings,
          CONVERT_TZ(u.last_seen, '+00:00', '+03:00') as last_seen,
          u.is_online,
          u.is_public_profile,
          CONVERT_TZ(u.created_at, '+00:00', '+03:00') as user_created_at,
          ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} as profession_name,
          ${languageCode === 'ar' ? 'p.description_ar' : 'p.description'} as profession_description,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as category_name,
          pc.id as category_id,
          ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} as city_name,
          ${languageCode === 'ar' ? 'prov.province_ar' : 'prov.province'} as province,
          CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
            ELSE NULL
          END AS main_image,
          CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(?, a.file_path)
          END AS profession_icon
        FROM profession_user pu
        LEFT JOIN users u ON u.id = pu.user_id
        LEFT JOIN prof_categories p ON p.id = pu.profession_id
        LEFT JOIN prof_categories pc ON pc.id = p.parent_id
        LEFT JOIN cities c ON c.id = u.city_id
        LEFT JOIN province prov ON prov.id = u.province_id
        LEFT JOIN ag_attachment a ON a.row_id = p.id AND a.table_name = ? AND a.type = ?
        LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
        WHERE p.is_active = 1 AND p.parent_id IS NOT NULL
      `;

      const params: any[] = [this.baseHost, this.baseHost, this.baseHost, this.ATTACH_TABLE_PROF, this.ATTACH_TYPE, this.ATTACH_TABLE_USERS, this.ATTACH_TYPE];

      if (professionId) {
        query += ' AND pu.profession_id = ?';
        params.push(professionId);
      }

      if (categoryId) {
        const subcategoryIds = await this.dataSource.query(
          'SELECT id FROM prof_categories WHERE parent_id = ? AND is_active = 1',
          [categoryId]
        );
        if (subcategoryIds.length > 0) {
          query += ` AND pu.profession_id IN (${subcategoryIds.map(() => '?').join(',')})`;
          params.push(...subcategoryIds.map((s: any) => s.id));
        } else {
          query += ' AND 1 = 0'; // Always false
        }
      }

      if (isVerified !== undefined && isVerified !== null) {
        query += ' AND pu.is_verified = ?';
        params.push(isVerified);
      }

      if (search) {
        query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR p.name LIKE ? OR p.name_ar LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      if (isMobile) {
        query += ' AND u.is_activated = 1';
      }

      // Count query
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT pu.id) as count FROM');
      const countResult = await this.dataSource.query(countQuery, params);
      const totalCount = countResult[0]?.count || 0;

      // Data query with pagination
      query += ' ORDER BY pu.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = await this.dataSource.query(query, params);

      return {
        succeeded: true,
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        filters_applied: {
          profession_id: professionId || null,
          category_id: categoryId || null,
          is_verified: isVerified !== undefined && isVerified !== null ? isVerified : null,
          search: search || null,
        },
        metadata: {
          platform: isMobile ? 'mobile' : 'web',
          language: languageCode,
          retrieved_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all profession users');
    }
  }

  /**
   * Get recommended professions for user
   */
  async getRecommendedProfessions(
    dto: GetRecommendedProfessionsDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.userId || currentUserId;

      // Get user's current professions
      const userProfessions = await this.dataSource.query(
        'SELECT profession_id, (SELECT parent_id FROM prof_categories WHERE id = profession_id) as category_id FROM profession_user WHERE user_id = ?',
        [targetUserId]
      );

      const userProfessionIds = userProfessions.map((p: any) => p.profession_id);
      const userCategoryIds = [...new Set(userProfessions.map((p: any) => p.category_id).filter((id: any) => id !== null))];

      // Get recommendations
      const recommendations = await this.dataSource.query(
        `SELECT 
          p.id,
          ${languageCode === 'ar' ? 'p.name_ar' : 'p.name'} as name,
          ${languageCode === 'ar' ? 'p.description_ar' : 'p.description'} as description,
          ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as category_name,
          pc.id as category_id,
          COUNT(DISTINCT pu2.user_id) as user_count,
          CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path
            ELSE CONCAT(?, a.file_path)
          END AS profession_icon
        FROM prof_categories p
        LEFT JOIN prof_categories pc ON pc.id = p.parent_id
        LEFT JOIN ag_attachment a ON a.row_id = p.id AND a.table_name = ? AND a.type = ?
        LEFT JOIN profession_user pu2 ON pu2.profession_id = p.id
        WHERE p.is_active = 1 AND p.parent_id IS NOT NULL
        ${userProfessionIds.length > 0 ? `AND p.id NOT IN (${userProfessionIds.map(() => '?').join(',')})` : ''}
        GROUP BY p.id, p.name, p.name_ar, p.description, p.description_ar, pc.name, pc.name_ar, pc.id, a.file_path
        ORDER BY 
          CASE WHEN p.parent_id IN (${userCategoryIds.length > 0 ? userCategoryIds.map(() => '?').join(',') : '0'}) THEN 1 ELSE 2 END,
          user_count DESC,
          p.name ASC
        LIMIT 10`,
        [
          this.baseHost,
          this.ATTACH_TABLE_PROF,
          this.ATTACH_TYPE,
          ...(userProfessionIds.length > 0 ? userProfessionIds : []),
          ...(userCategoryIds.length > 0 ? userCategoryIds : []),
        ]
      );

      return {
        succeeded: true,
        recommendations,
        metadata: {
          user_professions_count: userProfessionIds.length,
          user_categories_count: userCategoryIds.length,
          language: languageCode,
          retrieved_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get recommended professions');
    }
  }

  /**
   * Get nearby professionals
   */
  async getNearbyProfessionals(
    dto: GetNearbyProfessionalsDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const {
        professionId,
        categoryId,
        subCategoryId,
        cityId,
        radius = 100,
        latitude,
        longitude,
        includeSelf = false,
        isVerified,
        minExperience,
        maxExperience,
        search,
        sortBy = 'distance',
        sortOrder = 'asc',
        page = 1,
        limit = 20,
      } = dto;

      const offset = (page - 1) * limit;

      // Validate coordinates
      const useCoordinates =
        latitude !== undefined &&
        latitude !== null &&
        longitude !== undefined &&
        longitude !== null &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      let professionals: any[] = [];
      let totalCount = 0;
      let searchCriteria: any = {};

      if (useCoordinates) {
        // Coordinate-based search
        let query = `
          SELECT 
            pu.id,
            pu.user_id,
            pu.is_primary,
            pu.experience_years,
            pu.is_verified,
            CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
            CONVERT_TZ(pu.created_at, '+00:00', '+03:00') as created_at,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.gender,
            u.bio,
            ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} as city_name,
            ${languageCode === 'ar' ? 'p.province_ar' : 'p.province'} as province,
            u.latitude,
            u.longitude,
            ${languageCode === 'ar' ? 'prof.name_ar' : 'prof.name'} as profession_name,
            ${languageCode === 'ar' ? 'prof.description_ar' : 'prof.description'} as profession_description,
            ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as category_name,
            pc.id as category_id,
            ${languageCode === 'ar' ? 'pc2.name_ar' : 'pc2.name'} as sub_category_name,
            pc2.id as sub_category_id,
            CASE 
              WHEN ua.file_path LIKE 'http%' THEN ua.file_path
              WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
              WHEN u.main_image LIKE 'http%' THEN u.main_image
              WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
              ELSE NULL
            END AS main_image,
            CASE 
              WHEN a.file_path LIKE 'http%' THEN a.file_path
              ELSE CONCAT(?, a.file_path)
            END AS profession_icon,
            (
              6371 * acos(
                cos(radians(?)) * cos(radians(u.latitude)) * 
                cos(radians(u.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(u.latitude))
              )
            ) AS distance_km
          FROM profession_user pu
          LEFT JOIN users u ON u.id = pu.user_id
          LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
          LEFT JOIN user_cities uc ON uc.user_id = u.id
          LEFT JOIN cities c ON c.id = uc.city_id
          LEFT JOIN province p ON p.id = c.province
          LEFT JOIN prof_categories prof ON prof.id = pu.profession_id
          LEFT JOIN prof_categories pc ON pc.id = prof.parent_id
          LEFT JOIN prof_categories pc2 ON pc2.id = pc.parent_id
          LEFT JOIN ag_attachment a ON a.row_id = prof.id AND a.table_name = ? AND a.type = ?
          WHERE u.is_activated = 1
            AND u.latitude IS NOT NULL
            AND u.longitude IS NOT NULL
        `;

        const params: any[] = [
          this.baseHost,
          this.baseHost,
          this.baseHost,
          latitude,
          longitude,
          latitude,
          this.ATTACH_TABLE_USERS,
          this.ATTACH_TYPE,
          this.ATTACH_TABLE_PROF,
          this.ATTACH_TYPE,
        ];

        if (!includeSelf) {
          query += ' AND u.id != ?';
          params.push(userId);
        }

        if (professionId) {
          query += ' AND pu.profession_id = ?';
          params.push(professionId);
        }

        if (categoryId) {
          query += ' AND prof.parent_id = ?';
          params.push(categoryId);
        }

        if (subCategoryId) {
          query += ' AND pc.parent_id = ?';
          params.push(subCategoryId);
        }

        if (isVerified !== undefined && isVerified !== null) {
          query += ' AND pu.is_verified = ?';
          params.push(isVerified);
        }

        if (minExperience !== undefined && minExperience !== null) {
          query += ' AND pu.experience_years >= ?';
          params.push(minExperience);
        }

        if (maxExperience !== undefined && maxExperience !== null) {
          query += ' AND pu.experience_years <= ?';
          params.push(maxExperience);
        }

        if (search) {
          query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR prof.name LIKE ? OR prof.name_ar LIKE ? OR pc.name LIKE ? OR pc.name_ar LIKE ?)`;
          const searchParam = `%${search}%`;
          params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        // Order by
        const orderBy = this.getOrderByClause(sortBy, sortOrder, true);
        query += ` ORDER BY ${orderBy}`;

        const allResults = await this.dataSource.query(query, params);
        totalCount = allResults.length;
        professionals = allResults.slice(offset, offset + limit);

        searchCriteria = {
          search_type: 'coordinates',
          latitude,
          longitude,
          radius_km: 'IGNORED - showing all professionals',
          profession_id: professionId || null,
          category_id: categoryId || null,
          sub_category_id: subCategoryId || null,
          is_verified: isVerified !== undefined && isVerified !== null ? isVerified : null,
          min_experience: minExperience || null,
          max_experience: maxExperience || null,
          search: search || null,
          sort_by: sortBy,
          sort_order: sortOrder,
          include_self: includeSelf,
        };
      } else {
        // City-based search
        let userCityIds: number[] = [];
        if (cityId) {
          userCityIds = [cityId];
        } else {
          const userCities = await this.dataSource.query(
            'SELECT city_id FROM user_cities WHERE user_id = ?',
            [userId]
          );
          userCityIds = userCities.map((uc: any) => uc.city_id);
        }

        if (userCityIds.length === 0) {
          return {
            succeeded: true,
            professionals: [],
            message: 'No cities found for user',
          };
        }

        let query = `
          SELECT 
            pu.id,
            pu.user_id,
            pu.is_primary,
            pu.experience_years,
            pu.is_verified,
            CONVERT_TZ(pu.verified_at, '+00:00', '+03:00') as verified_at,
            CONVERT_TZ(pu.created_at, '+00:00', '+03:00') as created_at,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.gender,
            u.bio,
            ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} as city_name,
            ${languageCode === 'ar' ? 'p.province_ar' : 'p.province'} as province,
            ${languageCode === 'ar' ? 'prof.name_ar' : 'prof.name'} as profession_name,
            ${languageCode === 'ar' ? 'prof.description_ar' : 'prof.description'} as profession_description,
            ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as category_name,
            pc.id as category_id,
            ${languageCode === 'ar' ? 'pc2.name_ar' : 'pc2.name'} as sub_category_name,
            pc2.id as sub_category_id,
            CASE 
              WHEN ua.file_path LIKE 'http%' THEN ua.file_path
              WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
              WHEN u.main_image LIKE 'http%' THEN u.main_image
              WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
              ELSE NULL
            END AS main_image,
            CASE 
              WHEN a.file_path LIKE 'http%' THEN a.file_path
              ELSE CONCAT(?, a.file_path)
            END AS profession_icon
          FROM profession_user pu
          LEFT JOIN users u ON u.id = pu.user_id
          LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
          LEFT JOIN user_cities uc ON uc.user_id = u.id
          LEFT JOIN cities c ON c.id = uc.city_id
          LEFT JOIN province p ON p.id = c.province
          LEFT JOIN prof_categories prof ON prof.id = pu.profession_id
          LEFT JOIN prof_categories pc ON pc.id = prof.parent_id
          LEFT JOIN prof_categories pc2 ON pc2.id = pc.parent_id
          LEFT JOIN ag_attachment a ON a.row_id = prof.id AND a.table_name = ? AND a.type = ?
          WHERE u.is_activated = 1
            AND uc.city_id IN (${userCityIds.map(() => '?').join(',')})
        `;

        const params: any[] = [
          this.baseHost,
          this.baseHost,
          this.baseHost,
          this.ATTACH_TABLE_USERS,
          this.ATTACH_TYPE,
          this.ATTACH_TABLE_PROF,
          this.ATTACH_TYPE,
          ...userCityIds,
        ];

        if (!includeSelf) {
          query += ' AND u.id != ?';
          params.push(userId);
        }

        if (professionId) {
          query += ' AND pu.profession_id = ?';
          params.push(professionId);
        }

        if (categoryId) {
          query += ' AND prof.parent_id = ?';
          params.push(categoryId);
        }

        if (subCategoryId) {
          query += ' AND pc.parent_id = ?';
          params.push(subCategoryId);
        }

        if (isVerified !== undefined && isVerified !== null) {
          query += ' AND pu.is_verified = ?';
          params.push(isVerified);
        }

        if (minExperience !== undefined && minExperience !== null) {
          query += ' AND pu.experience_years >= ?';
          params.push(minExperience);
        }

        if (maxExperience !== undefined && maxExperience !== null) {
          query += ' AND pu.experience_years <= ?';
          params.push(maxExperience);
        }

        if (search) {
          query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR prof.name LIKE ? OR prof.name_ar LIKE ? OR pc.name LIKE ? OR pc.name_ar LIKE ?)`;
          const searchParam = `%${search}%`;
          params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        // Order by
        const orderBy = this.getOrderByClause(sortBy, sortOrder, false);
        query += ` ORDER BY ${orderBy}`;

        const allResults = await this.dataSource.query(query, params);
        totalCount = allResults.length;
        professionals = allResults.slice(offset, offset + limit);

        searchCriteria = {
          search_type: 'cities',
          user_cities: userCityIds,
          profession_id: professionId || null,
          category_id: categoryId || null,
          sub_category_id: subCategoryId || null,
          city_id: cityId || null,
          is_verified: isVerified !== undefined && isVerified !== null ? isVerified : null,
          min_experience: minExperience || null,
          max_experience: maxExperience || null,
          search: search || null,
          sort_by: sortBy,
          sort_order: sortOrder,
          include_self: includeSelf,
        };
      }

      return {
        succeeded: true,
        professionals,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        search_criteria: searchCriteria,
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          search_method: useCoordinates ? 'coordinates' : 'cities',
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get nearby professionals');
    }
  }

  /**
   * Get order by clause
   */
  private getOrderByClause(sortBy: string, sortOrder: string, useCoordinates: boolean): string {
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    switch (sortBy.toLowerCase()) {
      case 'distance':
        if (useCoordinates) {
          return `distance_km ${direction}`;
        }
        return 'pu.is_primary DESC, pu.is_verified DESC, pu.created_at DESC';

      case 'experience':
        return `pu.experience_years ${direction}, pu.is_primary DESC`;

      case 'verified':
        return `pu.is_verified ${direction}, pu.is_primary DESC, pu.created_at DESC`;

      case 'name':
        return `u.first_name ${direction}, u.last_name ${direction}`;

      case 'created':
        return `pu.created_at ${direction}`;

      case 'primary':
        return 'pu.is_primary DESC, pu.is_verified DESC, pu.created_at DESC';

      default:
        if (useCoordinates) {
          return 'distance_km ASC, pu.is_primary DESC, pu.is_verified DESC';
        }
        return 'pu.is_primary DESC, pu.is_verified DESC, pu.created_at DESC';
    }
  }

  /**
   * Get all users with professions (simplified)
   */
  async getAllUsersWithProfessions(
    dto: GetAllUsersWithProfessionsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      let query = `
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.longitude,
          u.latitude,
          CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
            ELSE NULL
          END AS profile_image
        FROM users u
        INNER JOIN profession_user pu ON pu.user_id = u.id
        INNER JOIN prof_categories pc ON pc.id = pu.profession_id
        LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
        WHERE u.is_activated = 1 AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
      `;

      const params: any[] = [this.baseHost, this.baseHost, this.ATTACH_TABLE_USERS, this.ATTACH_TYPE];

      if (dto.subcategoryId) {
        query += ' AND pu.profession_id = ?';
        params.push(dto.subcategoryId);
      } else if (dto.categoryId) {
        const subcategoryIds = await this.dataSource.query(
          'SELECT id FROM prof_categories WHERE parent_id = ? AND is_active = 1',
          [dto.categoryId]
        );
        if (subcategoryIds.length > 0) {
          query += ` AND pu.profession_id IN (${subcategoryIds.map(() => '?').join(',')})`;
          params.push(...subcategoryIds.map((s: any) => s.id));
        } else {
          query += ' AND 1 = 0';
        }
      }

      query += ' ORDER BY u.first_name ASC, u.last_name ASC';

      const users = await this.dataSource.query(query, params);

      // Get professions for each user
      const userIds = users.map((u: any) => u.id);
      if (userIds.length > 0) {
        const professions = await this.dataSource.query(
          `SELECT 
            pu.user_id,
            ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as profession_name,
            pc.id as profession_id
          FROM profession_user pu
          LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
          WHERE pu.user_id IN (${userIds.map(() => '?').join(',')}) AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
          ORDER BY pu.is_primary DESC, pc.name ASC`,
          userIds
        );

        const professionsByUser = new Map<string, any[]>();
        professions.forEach((p: any) => {
          if (!professionsByUser.has(p.user_id)) {
            professionsByUser.set(p.user_id, []);
          }
          professionsByUser.get(p.user_id)!.push({
            id: p.profession_id,
            name: p.profession_name,
          });
        });

        users.forEach((user: any) => {
          user.professions = professionsByUser.get(user.id) || [];
        });
      }

      return {
        succeeded: true,
        users,
        total: users.length,
        filter: {
          category_id: dto.categoryId || null,
          subcategory_id: dto.subcategoryId || null,
          filter_applied: !!(dto.categoryId || dto.subcategoryId),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all users with professions');
    }
  }

  /**
   * Get all professionals (paginated)
   */
  async getAllProfessionals(
    dto: GetAllProfessionalsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { categoryId, subcategoryId, search, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Count query
      let countQuery = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        INNER JOIN profession_user pu ON pu.user_id = u.id
        INNER JOIN prof_categories pc ON pc.id = pu.profession_id
        WHERE u.is_activated = 1 AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
      `;

      const countParams: any[] = [];

      if (subcategoryId) {
        countQuery += ' AND pu.profession_id = ?';
        countParams.push(subcategoryId);
      } else if (categoryId) {
        const subcategoryIds = await this.dataSource.query(
          'SELECT id FROM prof_categories WHERE parent_id = ? AND is_active = 1',
          [categoryId]
        );
        if (subcategoryIds.length > 0) {
          countQuery += ` AND pu.profession_id IN (${subcategoryIds.map(() => '?').join(',')})`;
          countParams.push(...subcategoryIds.map((s: any) => s.id));
        } else {
          countQuery += ' AND 1 = 0';
        }
      }

      if (search) {
        countQuery += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR pc.name LIKE ? OR pc.name_ar LIKE ?)`;
        const searchParam = `%${search}%`;
        countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      const totalResult = await this.dataSource.query(countQuery, countParams);
      const totalCount = totalResult[0]?.count || 0;

      // Data query
      let query = `
        SELECT DISTINCT
          u.id,
          u.first_name,
          u.last_name,
          u.longitude,
          u.latitude,
          CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
            ELSE NULL
          END AS profile_image
        FROM users u
        INNER JOIN profession_user pu ON pu.user_id = u.id
        INNER JOIN prof_categories pc ON pc.id = pu.profession_id
        LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
        WHERE u.is_activated = 1 AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
      `;

      const params: any[] = [this.baseHost, this.baseHost, this.ATTACH_TABLE_USERS, this.ATTACH_TYPE];

      if (subcategoryId) {
        query += ' AND pu.profession_id = ?';
        params.push(subcategoryId);
      } else if (categoryId) {
        const subcategoryIds = await this.dataSource.query(
          'SELECT id FROM prof_categories WHERE parent_id = ? AND is_active = 1',
          [categoryId]
        );
        if (subcategoryIds.length > 0) {
          query += ` AND pu.profession_id IN (${subcategoryIds.map(() => '?').join(',')})`;
          params.push(...subcategoryIds.map((s: any) => s.id));
        } else {
          query += ' AND 1 = 0';
        }
      }

      if (search) {
        query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR pc.name LIKE ? OR pc.name_ar LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      query += ' ORDER BY u.first_name ASC, u.last_name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = await this.dataSource.query(query, params);

      // Get professions for each user
      const userIds = users.map((u: any) => u.id);
      if (userIds.length > 0) {
        const professions = await this.dataSource.query(
          `SELECT 
            pu.user_id,
            ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as profession_name,
            pc.id as profession_id
          FROM profession_user pu
          LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
          WHERE pu.user_id IN (${userIds.map(() => '?').join(',')}) AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
          ORDER BY pu.is_primary DESC, pc.name ASC`,
          userIds
        );

        const professionsByUser = new Map<string, any[]>();
        professions.forEach((p: any) => {
          if (!professionsByUser.has(p.user_id)) {
            professionsByUser.set(p.user_id, []);
          }
          professionsByUser.get(p.user_id)!.push({
            id: p.profession_id,
            name: p.profession_name,
          });
        });

        users.forEach((user: any) => {
          user.professions = professionsByUser.get(user.id) || [];
        });
      }

      return {
        succeeded: true,
        users,
        total: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        filter: {
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          filter_applied: !!(categoryId || subcategoryId),
        },
        search: {
          term: search || null,
          applied: !!search,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all professionals');
    }
  }

  /**
   * Get top specialists
   */
  async getTopSpecialists(
    dto: GetTopSpecialistsDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { subcategoryId, search, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Count query
      let countQuery = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        WHERE u.is_activated = 1 AND u.is_top = 1
      `;

      const countParams: any[] = [];

      if (subcategoryId) {
        countQuery += ` AND EXISTS (
          SELECT 1 FROM profession_user pu WHERE pu.user_id = u.id AND pu.profession_id = ?
        )`;
        countParams.push(subcategoryId);
      }

      if (search) {
        countQuery += ` AND (
          u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR
          EXISTS (
            SELECT 1 FROM profession_user pu
            LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
            WHERE pu.user_id = u.id AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
            AND (pc.name LIKE ? OR pc.name_ar LIKE ?)
          )
        )`;
        const searchParam = `%${search}%`;
        countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      const totalResult = await this.dataSource.query(countQuery, countParams);
      const totalCount = totalResult[0]?.count || 0;

      // Data query
      let query = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.country_code,
          u.gender,
          u.bio,
          u.website,
          u.location,
          u.user_work,
          u.languages,
          u.longitude,
          u.latitude,
          u.is_top,
          u.followers_count,
          u.following_count,
          u.average_rating,
          u.total_ratings,
          u.is_public_profile,
          CONVERT_TZ(u.last_seen, '+00:00', '+03:00') as last_seen,
          u.is_online,
          CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
            ELSE NULL
          END AS profile_image
        FROM users u
        LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
        WHERE u.is_activated = 1 AND u.is_top = 1
      `;

      const params: any[] = [this.baseHost, this.baseHost, this.ATTACH_TABLE_USERS, this.ATTACH_TYPE];

      if (subcategoryId) {
        query += ` AND EXISTS (
          SELECT 1 FROM profession_user pu WHERE pu.user_id = u.id AND pu.profession_id = ?
        )`;
        params.push(subcategoryId);
      }

      if (search) {
        query += ` AND (
          u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR
          EXISTS (
            SELECT 1 FROM profession_user pu
            LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
            WHERE pu.user_id = u.id AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
            AND (pc.name LIKE ? OR pc.name_ar LIKE ?)
          )
        )`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      query += ' ORDER BY u.first_name ASC, u.last_name ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const users = await this.dataSource.query(query, params);

      // Get professions and cities for each user
      const userIds = users.map((u: any) => u.id);
      if (userIds.length > 0) {
        // Get professions
        const professions = await this.dataSource.query(
          `SELECT 
            pu.user_id,
            ${languageCode === 'ar' ? 'pc.name_ar' : 'pc.name'} as profession_name,
            pc.id as profession_id,
            parent_pc.id as category_id,
            ${languageCode === 'ar' ? 'parent_pc.name_ar' : 'parent_pc.name'} as category_name
          FROM profession_user pu
          LEFT JOIN prof_categories pc ON pc.id = pu.profession_id
          LEFT JOIN prof_categories parent_pc ON parent_pc.id = pc.parent_id
          WHERE pu.user_id IN (${userIds.map(() => '?').join(',')}) AND pc.is_active = 1 AND pc.parent_id IS NOT NULL
          ORDER BY pu.is_primary DESC, pc.name ASC`,
          userIds
        );

        const professionsByUser = new Map<string, any[]>();
        professions.forEach((p: any) => {
          if (!professionsByUser.has(p.user_id)) {
            professionsByUser.set(p.user_id, []);
          }
          professionsByUser.get(p.user_id)!.push({
            id: p.profession_id,
            name: p.profession_name,
            category: {
              id: p.category_id,
              name: p.category_name,
            },
          });
        });

        // Get cities
        const cities = await this.dataSource.query(
          `SELECT 
            uc.user_id,
            uc.id,
            ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} as city_name,
            c.city_name_ar,
            ${languageCode === 'ar' ? 'p.province_ar' : 'p.province'} as province,
            p.province_ar
          FROM user_cities uc
          LEFT JOIN cities c ON c.id = uc.city_id
          LEFT JOIN province p ON p.id = c.province
          WHERE uc.user_id IN (${userIds.map(() => '?').join(',')})`,
          userIds
        );

        const citiesByUser = new Map<string, any[]>();
        cities.forEach((c: any) => {
          if (!citiesByUser.has(c.user_id)) {
            citiesByUser.set(c.user_id, []);
          }
          citiesByUser.get(c.user_id)!.push({
            id: c.id,
            city_name: languageCode === 'ar' ? c.city_name_ar : c.city_name,
            province: languageCode === 'ar' ? c.province_ar : c.province,
          });
        });

        users.forEach((user: any) => {
          user.professions = professionsByUser.get(user.id) || [];
          user.cities = citiesByUser.get(user.id) || [];
        });
      }

      return {
        succeeded: true,
        users,
        total: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        search: {
          term: search || null,
          applied: !!search,
        },
        filter: {
          subcategory_id: subcategoryId || null,
          applied: !!subcategoryId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get top specialists');
    }
  }

  /**
   * Get comprehensive user profile
   * Note: This is a very complex method that requires integration with posts, follows, etc.
   * Simplified version - full implementation would require ProfPosts, ProfFollow modules
   */
  async getUserProfile(
    dto: GetUserProfileDto,
    requestingUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.userId || requestingUserId;
      const { page = 1, limit = 10 } = dto;
      const offset = (page - 1) * limit;

      // Get user basic info
      const user = await this.dataSource.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.country_code,
          u.gender,
          u.bio,
          u.website,
          u.location,
          u.latitude,
          u.longitude,
          u.languages,
          u.user_work,
          u.is_public_profile,
          u.is_activated,
          u.created_at,
          u.last_seen,
          u.average_rating,
          u.total_ratings,
          u.followers_count,
          u.following_count,
          CASE 
            WHEN ua.file_path LIKE 'http%' THEN ua.file_path
            WHEN ua.file_path IS NOT NULL AND ua.file_path != '' THEN CONCAT(?, ua.file_path)
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            WHEN u.main_image IS NOT NULL AND u.main_image != '' THEN CONCAT(?, u.main_image)
            ELSE NULL
          END AS main_image,
          CASE 
            WHEN u.cover_image LIKE 'http%' THEN u.cover_image
            WHEN u.cover_image IS NOT NULL AND u.cover_image != '' THEN u.cover_image
            ELSE NULL
          END AS cover_image,
          CASE 
            WHEN u.cv LIKE 'http%' THEN u.cv
            WHEN u.cv IS NOT NULL AND u.cv != '' THEN u.cv
            ELSE NULL
          END AS cv
        FROM users u
        LEFT JOIN ag_attachment ua ON ua.row_id = u.id AND ua.table_name = ? AND ua.type = ?
        WHERE u.id = ?`,
        [this.baseHost, this.baseHost, this.ATTACH_TABLE_USERS, this.ATTACH_TYPE, targetUserId]
      );

      if (!user[0]) {
        throw new NotFoundException('User not found');
      }

      // Get professions
      const professions = await this.getUserProfessions({ userId: targetUserId }, requestingUserId, languageCode);

      // Get cities
      const cities = await this.dataSource.query(
        `SELECT 
          uc.id,
          ${languageCode === 'ar' ? 'c.city_name_ar' : 'c.city_name'} as city_name,
          ${languageCode === 'ar' ? 'p.province_ar' : 'p.province'} as province
        FROM user_cities uc
        LEFT JOIN cities c ON c.id = uc.city_id
        LEFT JOIN province p ON p.id = c.province
        WHERE uc.user_id = ?`,
        [targetUserId]
      );

      // Get working hours (if SpecialistWorkingHours table exists)
      const workingHours = await this.dataSource.query(
        'SELECT id, day_of_week, start_time, end_time, is_available FROM specialist_working_hours WHERE specialist_id = ? ORDER BY day_of_week ASC',
        [targetUserId]
      ).catch(() => []);

      // Get posts count
      const postsCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_posts WHERE user_id = ? AND is_deleted = 0',
        [targetUserId]
      ).catch(() => [{ count: 0 }]);

      // Check follow relationships
      const isFollowing = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_follow WHERE follower_id = ? AND following_id = ? AND status = ?',
        [requestingUserId, targetUserId, 'following']
      ).catch(() => [{ count: 0 }]);

      const isFollowedBy = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_follow WHERE follower_id = ? AND following_id = ? AND status = ?',
        [targetUserId, requestingUserId, 'following']
      ).catch(() => [{ count: 0 }]);

      // Get posts (simplified - would need full ProfPosts integration)
      const posts = await this.dataSource.query(
        `SELECT 
          pp.id,
          pp.user_id,
          pp.content,
          pp.description,
          pp.post_type,
          pp.is_deleted,
          pp.attachment_id,
          pp.likes_count,
          pp.comments_count,
          pp.shares_count,
          pp.views_count,
          pp.is_pinned,
          pp.pinned_at,
          pp.is_public,
          pp.created_at,
          pp.updated_at
        FROM prof_posts pp
        WHERE pp.user_id = ? AND pp.is_deleted = 0 AND pp.post_type NOT IN ('text', 'article')
        ORDER BY pp.created_at DESC
        LIMIT ? OFFSET ?`,
        [targetUserId, limit, offset]
      ).catch(() => []);

      // Get quotes (text and article posts)
      const quotes = await this.dataSource.query(
        `SELECT 
          pp.id,
          pp.user_id,
          pp.content,
          pp.description,
          pp.post_type,
          pp.is_deleted,
          pp.attachment_id,
          pp.likes_count,
          pp.comments_count,
          pp.shares_count,
          pp.views_count,
          pp.is_pinned,
          pp.pinned_at,
          pp.is_public,
          pp.created_at,
          pp.updated_at
        FROM prof_posts pp
        WHERE pp.user_id = ? AND pp.is_deleted = 0 AND pp.post_type IN ('text', 'article')
        ORDER BY pp.created_at DESC`,
        [targetUserId]
      ).catch(() => []);

      // Check if user is blocked
      const isBlocked = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?',
        [targetUserId, requestingUserId]
      ).catch(() => [{ count: 0 }]);

      if (isBlocked[0]?.count > 0) {
        return {
          succeeded: true,
          profile: {
            user: null,
            professions: [],
            cities: [],
            working_hours: [],
            stats: {
              posts_count: 0,
              followers_count: 0,
              following_count: 0,
              professions_count: 0,
              verified_professions_count: 0,
              cities_count: 0,
              total_experience_years: 0,
            },
            relationship: {
              is_self: false,
              is_following: false,
              is_followed_by: false,
              can_follow: false,
              can_message: false,
            },
            recent_followers: [],
            recent_following: [],
          },
          posts: {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
            },
          },
          quotes: [],
          metadata: {
            language: languageCode,
            retrieved_at: new Date().toISOString(),
            requesting_user_id: requestingUserId,
            target_user_id: targetUserId,
            total_posts: 0,
            regular_posts_count: 0,
            quotes_count: 0,
            is_blocked: true,
          },
        };
      }

      // Calculate statistics
      const totalProfessions = professions.professions?.length || 0;
      const verifiedProfessions = professions.professions?.filter((p: any) => p.is_verified === 1).length || 0;
      const totalExperience = professions.professions?.reduce((sum: number, p: any) => sum + (p.experience_years || 0), 0) || 0;

      return {
        succeeded: true,
        profile: {
          user: user[0],
          professions: professions.professions || [],
          cities: cities,
          working_hours: workingHours.map((wh: any) => ({
            id: wh.id,
            dayOfWeek: wh.day_of_week,
            startTime: wh.start_time,
            endTime: wh.end_time,
            isAvailable: wh.is_available === 1,
          })),
          stats: {
            posts_count: postsCount[0]?.count || 0,
            followers_count: user[0].followers_count || 0,
            following_count: user[0].following_count || 0,
            professions_count: totalProfessions,
            verified_professions_count: verifiedProfessions,
            cities_count: cities.length,
            total_experience_years: totalExperience,
          },
          relationship: {
            is_self: requestingUserId === targetUserId,
            is_following: (isFollowing[0]?.count || 0) > 0,
            is_followed_by: (isFollowedBy[0]?.count || 0) > 0,
            can_follow: requestingUserId !== targetUserId && (isFollowing[0]?.count || 0) === 0,
            can_message: requestingUserId === targetUserId || (isFollowing[0]?.count || 0) > 0 || (isFollowedBy[0]?.count || 0) > 0,
          },
          recent_followers: [], // TODO: Implement
          recent_following: [], // TODO: Implement
        },
        posts: {
          data: posts,
          pagination: {
            page,
            limit,
            total: postsCount[0]?.count || 0,
            pages: Math.ceil((postsCount[0]?.count || 0) / limit),
          },
        },
        quotes: quotes,
        metadata: {
          language: languageCode,
          retrieved_at: new Date().toISOString(),
          requesting_user_id: requestingUserId,
          target_user_id: targetUserId,
          total_posts: postsCount[0]?.count || 0,
          regular_posts_count: posts.length,
          quotes_count: quotes.length,
          is_blocked: false,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }

  /**
   * Update user profession (Admin functionality)
   * Supports updating professions for any user by providing user_id
   */
  async updateUserProfessionAdmin(
    dto: UpdateUserProfessionAdminDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetUserId = dto.userId || currentUserId;

      // Validate each profession
      const validProfessions: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < dto.professions.length; i++) {
        const prof = dto.professions[i];

        if (prof.professionUserId) {
          // Update operation
          const professionUser = await queryRunner.manager.findOne(ProfessionUserEntity, {
            where: { id: prof.professionUserId },
          });

          if (!professionUser || professionUser.userId !== targetUserId) {
            errors.push(`Profession User record not found or doesn't belong to target user (index ${i})`);
            continue;
          }

          if (prof.professionId && prof.professionId !== professionUser.professionId) {
            // Validate new profession
            const newProfession = await this.profCategoriesRepository.findOne({
              where: { id: prof.professionId, isActive: 1 },
            });

            if (!newProfession || newProfession.parentId === null) {
              errors.push(`Profession not found or is a category for ID ${prof.professionId} (index ${i})`);
              continue;
            }

            // Check if user already has this profession
            const existing = await queryRunner.manager.findOne(ProfessionUserEntity, {
              where: { userId: targetUserId, professionId: prof.professionId },
            });

            if (existing && existing.id !== prof.professionUserId) {
              errors.push(`User already has profession ID ${prof.professionId} (index ${i})`);
              continue;
            }
          }

          validProfessions.push({ action: 'update', ...prof });
        } else {
          // Add operation
          if (!prof.professionId) {
            errors.push(`Profession ID is required for new profession at index ${i}`);
            continue;
          }

          const profession = await this.profCategoriesRepository.findOne({
            where: { id: prof.professionId, isActive: 1 },
          });

          if (!profession || profession.parentId === null) {
            errors.push(`Profession not found or is a category for ID ${prof.professionId} (index ${i})`);
            continue;
          }

          const existing = await queryRunner.manager.findOne(ProfessionUserEntity, {
            where: { userId: targetUserId, professionId: prof.professionId },
          });

          if (existing) {
            errors.push(`User already has profession ID ${prof.professionId} (index ${i})`);
            continue;
          }

          validProfessions.push({ action: 'add', ...prof });
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException({ message: 'Validation errors', errors, validProfessionsCount: validProfessions.length });
      }

      const updatedProfessions: any[] = [];
      const addedProfessions: any[] = [];

      for (const prof of validProfessions) {
        if (prof.action === 'update') {
          const professionUser = await queryRunner.manager.findOne(ProfessionUserEntity, {
            where: { id: prof.professionUserId },
          });

          let updated = false;

          if (prof.professionId !== undefined && prof.professionId !== professionUser!.professionId) {
            professionUser!.professionId = prof.professionId;
            updated = true;
          }

          if (prof.experienceYears !== undefined && prof.experienceYears !== professionUser!.experienceYears) {
            professionUser!.experienceYears = prof.experienceYears;
            updated = true;
          }

          if (prof.isPrimary !== undefined && prof.isPrimary !== professionUser!.isPrimary) {
            professionUser!.isPrimary = prof.isPrimary;
            updated = true;

            // If setting as primary, unset others
            if (prof.isPrimary === 1) {
              await queryRunner.manager
                .createQueryBuilder()
                .update(ProfessionUserEntity)
                .set({ isPrimary: 0 })
                .where('user_id = :userId', { userId: targetUserId })
                .andWhere('id != :id', { id: prof.professionUserId })
                .execute();
            }
          }

          if (updated) {
            await queryRunner.manager.save(professionUser!);
            updatedProfessions.push({
              profession_user_id: professionUser!.id,
              profession_id: professionUser!.professionId,
              experience_years: professionUser!.experienceYears,
              is_primary: professionUser!.isPrimary,
            });
          }
        } else {
          // Add
          const professionUser = this.professionUserRepository.create({
            userId: targetUserId,
            professionId: prof.professionId!,
            isPrimary: prof.isPrimary || 0,
            experienceYears: prof.experienceYears || null,
            isVerified: 0,
          });

          if (prof.isPrimary === 1) {
            await queryRunner.manager.update(
              ProfessionUserEntity,
              { userId: targetUserId },
              { isPrimary: 0 }
            );
          }

          const saved = await queryRunner.manager.save(professionUser);
          addedProfessions.push({
            profession_user_id: saved.id,
            profession_id: saved.professionId,
            experience_years: saved.experienceYears,
            is_primary: saved.isPrimary,
          });
        }
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Professions processed successfully',
        updated_professions: updatedProfessions,
        added_professions: addedProfessions,
        total_updated: updatedProfessions.length,
        total_added: addedProfessions.length,
        target_user_id: targetUserId,
        is_admin_action: !!dto.userId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user profession');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete user professions (Admin functionality)
   */
  async deleteUserProfessionAdmin(
    dto: DeleteUserProfessionAdminDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetUserId = dto.userId || currentUserId;

      // Validate each profession user record
      const validIds: number[] = [];
      const errors: string[] = [];

      for (let i = 0; i < dto.professionUserIds.length; i++) {
        const professionUserId = dto.professionUserIds[i];
        const professionUser = await queryRunner.manager.findOne(ProfessionUserEntity, {
          where: { id: professionUserId },
        });

        if (!professionUser) {
          errors.push(`Profession User record not found for ID ${professionUserId} (index ${i})`);
          continue;
        }

        if (professionUser.userId !== targetUserId) {
          errors.push(`Profession User ID ${professionUserId} does not belong to target user (index ${i})`);
          continue;
        }

        validIds.push(professionUserId);
      }

      if (errors.length > 0) {
        throw new BadRequestException({ message: 'Validation errors', errors, validProfessionUserIdsCount: validIds.length });
      }

      const deletedIds: number[] = [];
      const failedDeletions: any[] = [];

      for (const professionUserId of validIds) {
        try {
          const professionUser = await queryRunner.manager.findOne(ProfessionUserEntity, {
            where: { id: professionUserId },
          });

          if (professionUser) {
            await queryRunner.manager.remove(professionUser);
            deletedIds.push(professionUserId);
          } else {
            failedDeletions.push({ profession_user_id: professionUserId, error: 'Record not found' });
          }
        } catch (error) {
          failedDeletions.push({ profession_user_id: professionUserId, error: 'Failed to delete' });
        }
      }

      if (failedDeletions.length > 0) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException({
          message: 'Some deletions failed',
          deleted_count: deletedIds.length,
          failed_deletions: failedDeletions,
          total_requested: validIds.length,
        });
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Professions deleted successfully',
        deleted_profession_user_ids: deletedIds,
        total_deleted: deletedIds.length,
        target_user_id: targetUserId,
        is_admin_action: !!dto.userId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user profession');
    } finally {
      await queryRunner.release();
    }
  }
}
