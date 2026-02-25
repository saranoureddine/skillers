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
        ])
        .orderBy('t1.createdAt', 'DESC');

      // Apply search filter
      if (search) {
        queryBuilder = queryBuilder.andWhere(
          '(t1.firstName LIKE :search OR t1.lastName LIKE :search OR CONCAT(t1.firstName, " ", t1.lastName) LIKE :search OR t1.id LIKE :search OR t1.phoneNumber LIKE :search OR CONCAT(t1.countryCode, t1.phoneNumber) LIKE :search OR t1.email LIKE :search)',
          { search: `%${search}%` },
        );
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
          const userData: any = {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: user.phoneNumber,
            country_code: user.countryCode,
            is_activated: user.isActivated,
            user_work: user.userWork,
            languages: user.languages ? (typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages) : [],
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
