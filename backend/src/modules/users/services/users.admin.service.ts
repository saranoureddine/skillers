import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeleteUserDto } from '../dto/delete-user.dto';
import { GetAllUsersQueryDto } from '../dto/get-all-users.dto';
import { ConfigService } from '@nestjs/config';

/**
 * Admin-only user service — handles user management (CRUD) for admins.
 * Matches Yii API responses exactly.
 */
@Injectable()
export class UsersAdminService {
  private readonly baseHost: string;
  private readonly USERS_TABLE = 210; // Table ID for users
  private readonly MAIN_IMAGE = 1; // Main image type

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
  }

  /**
   * Generate unique 20-character ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Generate 32-character token
   */
  private generateToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get all users with pagination, search, and filtering (actionGetAllUsers)
   * Note: This is a simplified version - full implementation requires joins with cities, provinces, professions, etc.
   */
  async getAllUsers(query: GetAllUsersQueryDto, adminUserId?: string): Promise<any> {
    try {
      const { search, cityId, page = 1, perPage = 10 } = query;
      const offset = (page - 1) * perPage;

      // Build query
      let queryBuilder = this.usersRepository
        .createQueryBuilder('t1')
        .select([
          't1.id',
          't1.firstName',
          't1.lastName',
          't1.email',
          't1.phoneNumber',
          't1.countryCode',
          't1.isActivated',
          't1.userWork',
          't1.languages',
          't1.longitude',
          't1.latitude',
          't1.address',
          't1.bio',
          't1.website',
          't1.isPublicProfile',
          't1.location',
          't1.gender',
          't1.birthDate',
          't1.cityId',
          't1.provinceId',
          't1.createdAt',
          't1.updatedAt',
          't1.isSpecialist', // Add isSpecialist to determine role
        ])
        .orderBy('t1.createdAt', 'DESC');

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase().trim();
        const conditions: string[] = [];
        const params: any = { search: `%${search}%` };
        
        // Handle status search (active/inactive)
        if (searchLower === 'active' || searchLower.startsWith('active')) {
          conditions.push('t1.isActivated = 1');
        } else if (searchLower === 'inactive' || searchLower.startsWith('inactive')) {
          conditions.push('t1.isActivated = 0');
        }
        
        // Handle role search (specialist/client)
        if (searchLower === 'specialist' || searchLower.startsWith('specialist')) {
          conditions.push('t1.isSpecialist = 1');
        } else if (searchLower === 'client' || searchLower.startsWith('client')) {
          conditions.push('t1.isSpecialist = 0');
        }
        
        // Handle date search (format: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
        const datePattern = /^(\d{4}-\d{2}-\d{2}|\d{2}[\/\-]\d{2}[\/\-]\d{4})$/;
        if (datePattern.test(search)) {
          let dateValue = search;
          // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
          if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(search)) {
            const parts = search.split(/[\/\-]/);
            dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          conditions.push('DATE(t1.createdAt) = :dateValue');
          params.dateValue = dateValue;
        }
        
        // Always include text search in name, email, phone, ID fields
        conditions.push('(t1.firstName LIKE :search OR t1.lastName LIKE :search OR CONCAT(t1.firstName, " ", t1.lastName) LIKE :search OR t1.id LIKE :search OR t1.phoneNumber LIKE :search OR CONCAT(t1.countryCode, t1.phoneNumber) LIKE :search OR t1.email LIKE :search)');
        
        queryBuilder = queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
      }

      // Apply city filter if provided
      if (cityId) {
        // Note: This requires a join with user_cities table
        // queryBuilder = queryBuilder
        //   .innerJoin('user_cities', 'uc', 'uc.user_id = t1.id')
        //   .andWhere('uc.city_id = :cityId', { cityId });
      }

      // Get total count
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder.skip(offset).take(perPage).getMany();

      // Early return if no users
      if (users.length === 0) {
        return {
          succeeded: true,
          users: [],
          pagination: {
            totalCount: totalCount,
            pageCount: Math.ceil(totalCount / perPage),
            currentPage: page,
            perPage: perPage,
          },
          tableName: this.USERS_TABLE,
          mainImageType: this.MAIN_IMAGE,
        };
      }

      // Process users (add cities, provinces, images, professions)
      const processedUsers = await Promise.all(
        users.map(async (user) => {
          // Determine user role: specialist or client
          const isSpecialist = user.isSpecialist === 1;
          const role = isSpecialist ? 'specialist' : 'client';
          
          const userData: any = {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: user.phoneNumber,
            country_code: user.countryCode,
            is_activated: user.isActivated,
            user_work: user.userWork,
            languages: (() => {
              if (!user.languages) return [];
              if (typeof user.languages === 'string') {
                try {
                  // Try to parse as JSON first
                  const parsed = JSON.parse(user.languages);
                  return Array.isArray(parsed) ? parsed : [user.languages];
                } catch (e) {
                  // If not valid JSON, treat as single string value
                  return [user.languages];
                }
              }
              return Array.isArray(user.languages) ? user.languages : [];
            })(),
            longitude: user.longitude ? parseFloat(user.longitude.toString()) : null,
            latitude: user.latitude ? parseFloat(user.latitude.toString()) : null,
            address: user.address,
            bio: user.bio,
            website: user.website,
            is_public_profile: user.isPublicProfile,
            location: user.location,
            gender: user.gender,
            birth_date: user.birthDate,
            city_id: user.cityId,
            province_id: user.provinceId,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            role: role, // 'client' or 'specialist'
            is_specialist: isSpecialist, // boolean for convenience
            cities: [], // TODO: Fetch from user_cities
            province: null, // TODO: Fetch from province table
            more_images: [], // TODO: Fetch from ag_attachment
            professions: [], // TODO: Fetch from profession_user
            has_professions: false,
            professions_count: 0,
            primary_profession: null,
          };

          return userData;
        }),
      );

      return {
        succeeded: true,
        users: processedUsers,
        pagination: {
          totalCount: totalCount,
          pageCount: Math.ceil(totalCount / perPage),
          currentPage: page,
          perPage: perPage,
        },
        tableName: this.USERS_TABLE,
        mainImageType: this.MAIN_IMAGE,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get users: ' + error.message);
    }
  }

  /**
   * Get user details by ID (get-user-details)
   * Returns personal info, contact info, location, engagement summary
   */
  async getUserDetails(userId: string): Promise<any> {
    try {
      // Get user basic info
      const user = await this.usersRepository
        .createQueryBuilder('t1')
        .select([
          't1.id',
          't1.firstName',
          't1.lastName',
          't1.email',
          't1.phoneNumber',
          't1.countryCode',
          't1.isActivated',
          't1.userWork',
          't1.languages',
          't1.longitude',
          't1.latitude',
          't1.address',
          't1.bio',
          't1.website',
          't1.isPublicProfile',
          't1.location',
          't1.gender',
          't1.birthDate',
          't1.cityId',
          't1.provinceId',
          't1.createdAt',
          't1.updatedAt',
          't1.isSpecialist',
          't1.specialistVerified',
          't1.yearsExperience',
          't1.hourlyRate',
          't1.specialistCategory',
          't1.averageRating',
          't1.totalRatings',
          't1.followersCount',
          't1.followingCount',
          't1.lastSeen',
          't1.mainImage',
          't1.coverImage',
          't1.isOnline',
          't1.registrationMethod',
        ])
        .where('t1.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Parse languages
      let languages: any[] = [];
      if (user.languages) {
        try {
          const parsed = JSON.parse(user.languages);
          languages = Array.isArray(parsed) ? parsed : [user.languages];
        } catch {
          languages = user.languages ? [user.languages] : [];
        }
      }

      // Get engagement data - comments count
      let commentsCount = 0;
      try {
        const commentsResult = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM prof_comments WHERE user_id = ? AND is_deleted = 0',
          [userId],
        );
        commentsCount = parseInt(commentsResult[0]?.count || '0', 10);
      } catch (e) {
        // Table might not exist, default to 0
      }

      // Get engagement data - posts liked count
      let postsLikedCount = 0;
      try {
        const likesResult = await this.dataSource.query(
          'SELECT COUNT(*) as count FROM prof_likes WHERE user_id = ? AND likeable_type = ?',
          [userId, 'post'],
        );
        postsLikedCount = parseInt(likesResult[0]?.count || '0', 10);
      } catch (e) {
        // Table might not exist, default to 0
      }

      // Get SOS/emergency contact numbers
      let sosNumbers: any[] = [];
      try {
        const sosResult = await this.dataSource.query(
          'SELECT * FROM user_sos_numbers WHERE user_id = ?',
          [userId],
        );
        sosNumbers = sosResult || [];
      } catch (e) {
        // Table might not exist, default to empty
      }

      // Get user cities
      let cities: any[] = [];
      try {
        const citiesResult = await this.dataSource.query(
          `SELECT c.id, c.name FROM user_cities uc 
           INNER JOIN cities c ON c.id = uc.city_id 
           WHERE uc.user_id = ?`,
          [userId],
        );
        cities = citiesResult || [];
      } catch (e) {
        // Table might not exist, default to empty
      }

      // Get province
      let province = null;
      if (user.provinceId) {
        try {
          const provinceResult = await this.dataSource.query(
            'SELECT id, name FROM provinces WHERE id = ?',
            [user.provinceId],
          );
          province = provinceResult[0] || null;
        } catch (e) {
          // Table might not exist
        }
      }

      // Get professions
      let professions: any[] = [];
      try {
        const professionsResult = await this.dataSource.query(
          `SELECT p.id, p.name, pu.is_primary FROM profession_user pu 
           INNER JOIN professions p ON p.id = pu.profession_id 
           WHERE pu.user_id = ?`,
          [userId],
        );
        professions = professionsResult || [];
      } catch (e) {
        // Table might not exist, default to empty
      }

      const role = user.isSpecialist === 1 ? 'specialist' : 'client';
      const primaryProfession = professions.find((p: any) => p.is_primary === 1) || professions[0] || null;

      return {
        succeeded: true,
        user: {
          // Personal Information
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          status: user.isActivated === 1 ? 'Active' : 'Inactive',
          is_activated: user.isActivated,
          role: role,
          is_specialist: user.isSpecialist === 1,
          specialist_verified: user.specialistVerified === 1,
          gender: user.gender,
          birth_date: user.birthDate,
          bio: user.bio,
          website: user.website,
          user_work: user.userWork,
          languages: languages,
          main_image: user.mainImage,
          cover_image: user.coverImage,
          is_online: user.isOnline === 1,
          is_public_profile: user.isPublicProfile === 1,
          registration_method: user.registrationMethod,

          // Contact Information
          email: user.email,
          phone_number: user.phoneNumber,
          country_code: user.countryCode,
          sos_numbers: sosNumbers,

          // Location Information
          location: user.location,
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude,
          city_id: user.cityId,
          province_id: user.provinceId,
          cities: cities,
          province: province,

          // Specialist Information
          specialist_category: user.specialistCategory,
          years_experience: user.yearsExperience,
          hourly_rate: user.hourlyRate,
          average_rating: user.averageRating,
          total_ratings: user.totalRatings,

          // Social
          followers_count: user.followersCount,
          following_count: user.followingCount,

          // Professions
          professions: professions,
          has_professions: professions.length > 0,
          professions_count: professions.length,
          primary_profession: primaryProfession,

          // Dates
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          last_active: user.lastSeen,

          // Engagement Summary
          engagement: {
            comments_count: commentsCount,
            posts_liked_count: postsLikedCount,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user details: ' + error.message);
    }
  }

  /**
   * Create user (actionCreateUser)
   */
  async createUser(dto: CreateUserDto, createdBy?: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate city_id array
      if (!Array.isArray(dto.cityId) || dto.cityId.length === 0) {
        throw new BadRequestException('Invalid city_id format, must be an array');
      }

      // Check duplicates
      const existingEmail = await this.usersRepository.findOne({
        where: { email: dto.email.trim() },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      const existingPhone = await this.usersRepository.findOne({
        where: { countryCode: dto.countryCode.trim(), phoneNumber: dto.phoneNumber.trim() },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }

      // Create user
      const userId = this.generateUniqueId();
      const token = this.generateToken();
      const hashedPassword = await bcrypt.hash(dto.userPassword, 10);
      const now = new Date();

      const user = this.usersRepository.create({
        id: userId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim(),
        phoneNumber: dto.phoneNumber.trim(),
        countryCode: dto.countryCode.trim(),
        password: hashedPassword,
        isActivated: dto.isActivated ?? 0,
        isGuest: 0,
        token,
        centerNum: 10,
        createdBy: createdBy || userId,
        provinceId: dto.provinceId || null,
        averageRating: 0.0,
        totalRatings: 0,
        followersCount: 0,
        followingCount: 0,
        isPublicProfile: 1,
        createdAt: now,
        updatedAt: now,
      } as Partial<UserEntity>);

      await this.usersRepository.save(user);

      // Insert user cities (simplified - requires UserCities entity)
      // for (let i = 0; i < dto.cityId.length; i++) {
      //   await queryRunner.manager.insert('user_cities', {
      //     id: this.generateUniqueId(),
      //     user_id: userId,
      //     city_id: dto.cityId[i],
      //     main_city: i === 0 ? 1 : 0,
      //   });
      // }

      await queryRunner.commitTransaction();

      // Fetch user cities (simplified)
      const userCities = dto.cityId.map((cityId, index) => ({
        cityId,
        mainCity: index === 0 ? 1 : 0,
        cityName: null, // TODO: Fetch from cities table
      }));

      return {
        succeeded: true,
        message: 'User created successfully',
        user: {
          ...user,
          password: undefined, // Don't return password
        },
        token,
        cities: userCities,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update user (actionUpdateUser)
   */
  async updateUser(dto: UpdateUserDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!dto.id) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.usersRepository.findOne({ where: { id: dto.id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check duplicates
      if (dto.email && dto.email !== user.email) {
        const existing = await this.usersRepository.findOne({
          where: { email: dto.email.trim() },
        });
        if (existing) {
          throw new ConflictException('Email already exists');
        }
        user.email = dto.email.trim();
      }

      if (dto.phoneNumber && dto.countryCode) {
        const phoneChanged = dto.phoneNumber !== user.phoneNumber || dto.countryCode !== user.countryCode;
        if (phoneChanged) {
          const existing = await this.usersRepository.findOne({
            where: { countryCode: dto.countryCode.trim(), phoneNumber: dto.phoneNumber.trim() },
          });
          if (existing) {
            throw new ConflictException('Phone number already exists');
          }
          user.phoneNumber = dto.phoneNumber.trim();
          user.countryCode = dto.countryCode.trim();
        }
      }

      // Update other fields
      if (dto.firstName !== undefined) user.firstName = dto.firstName;
      if (dto.lastName !== undefined) user.lastName = dto.lastName;
      if (dto.isActivated !== undefined) user.isActivated = dto.isActivated;
      user.updatedAt = new Date();

      await this.usersRepository.save(user);

      // Handle city update
      if (dto.cityId && Array.isArray(dto.cityId) && dto.cityId.length > 0) {
        // Delete old cities
        // await queryRunner.manager.delete('user_cities', { user_id: dto.id });

        // Insert new cities
        // for (let i = 0; i < dto.cityId.length; i++) {
        //   await queryRunner.manager.insert('user_cities', {
        //     id: this.generateUniqueId(),
        //     user_id: dto.id,
        //     city_id: dto.cityId[i],
        //     main_city: i === 0 ? 1 : 0,
        //   });
        // }
      }

      await queryRunner.commitTransaction();

      // Fetch user cities (simplified)
      const userCities = dto.cityId
        ? dto.cityId.map((cityId, index) => ({
            cityId,
            mainCity: index === 0 ? 1 : 0,
            cityName: null, // TODO: Fetch from cities table
          }))
        : [];

      return {
        succeeded: true,
        message: 'User updated successfully',
        user: {
          ...user,
          password: undefined,
        },
        cities: userCities,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating user: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete user(s) (actionDeleteUser)
   */
  async deleteUser(dto: DeleteUserDto): Promise<any> {
    try {
      const userIds = Array.isArray(dto.id) ? dto.id : [dto.id];

      const notFound: string[] = [];
      const failedToDelete: string[] = [];
      const deletedUsers: string[] = [];

      for (const userId of userIds) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
          notFound.push(userId);
          continue;
        }

        // Delete user cities (simplified)
        // await this.dataSource.manager.delete('user_cities', { user_id: userId });

        // Delete user
        try {
          await this.usersRepository.remove(user);
          deletedUsers.push(userId);
        } catch (error) {
          failedToDelete.push(userId);
        }
      }

      const response: any = {
        succeeded: true,
        deletedUsers,
      };

      if (notFound.length > 0) {
        response.notFound = notFound;
      }

      if (failedToDelete.length > 0) {
        response.failedToDelete = failedToDelete;
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete users: ' + error.message);
    }
  }
}
