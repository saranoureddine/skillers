import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { AgUserEntity } from '../entities/ag-user.entity';
import { AgUserCityEntity } from '../entities/ag-user-city.entity';
import { AgUserStoreEntity } from '../entities/ag-user-store.entity';
import { CreateAgUserDto } from '../dto/create-ag-user.dto';
import { UpdateAgUserDto } from '../dto/update-ag-user.dto';
import { DeleteAgUserDto } from '../dto/delete-ag-user.dto';
import { LoginAgUserDto } from '../dto/login-ag-user.dto';
import { ChangePasswordAgUserDto } from '../dto/change-password-ag-user.dto';
import { ForgotPasswordAgUserDto } from '../dto/forgot-password-ag-user.dto';
import { CheckResetCodeAgUserDto } from '../dto/check-reset-code-ag-user.dto';
import { ResetPasswordAgUserDto } from '../dto/reset-password-ag-user.dto';
import { GetAllAgUsersQueryDto } from '../dto/get-all-ag-users.dto';
import { ConfigService } from '@nestjs/config';

/**
 * AgUsers Admin Service
 * Handles all admin user (ag_users) operations matching Yii AgUsersController
 */
@Injectable()
export class AgUsersAdminService {
  private readonly logger = new Logger(AgUsersAdminService.name);
  private readonly baseHost: string;
  private readonly TABLE_USERS = 1; // ag_attachment.table_name for ag_users
  private readonly VIDEOS = 2; // attachment.type for video files
  private readonly RESEND_COUNT = 5;
  private readonly RESEND_TIME = 120; // seconds
  private readonly EXPIRY_TIME = 600; // 10 minutes

  constructor(
    @InjectRepository(AgUserEntity)
    private readonly agUsersRepository: Repository<AgUserEntity>,
    @InjectRepository(AgUserCityEntity)
    private readonly agUsersCitiesRepository: Repository<AgUserCityEntity>,
    @InjectRepository(AgUserStoreEntity)
    private readonly agUserStoresRepository: Repository<AgUserStoreEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
    this.logger.log('AgUsersAdminService initialized');
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
   * Generate 6-digit code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Extract token from Authorization header
   */
  private extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    return authHeader.replace(/^(Bearer|Token)\s+/i, '').trim() || null;
  }

  /**
   * Validate token and return user ID
   */
  async validateToken(token: string): Promise<{ success: boolean; user?: any; user_id?: string }> {
    try {
      const user = await this.agUsersRepository.findOne({
        where: { token },
        select: ['userId', 'userName', 'userRole', 'active'],
      });

      if (!user || user.active !== '1') {
        return { success: false };
      }

      return {
        success: true,
        user: {
          user_id: user.userId,
          user_name: user.userName,
          user_role: user.userRole,
        },
        user_id: user.userId,
      };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Require authentication - throws if invalid
   */
  async requireAuth(token: string): Promise<string> {
    this.logger.debug(`requireAuth called with token: ${token ? token.substring(0, 20) + '...' : 'null'}`);
    
    try {
    const result = await this.validateToken(token);
      this.logger.debug(`validateToken result: success=${result.success}, user_id=${result.user_id}`);
      
    if (!result.success || !result.user_id) {
        this.logger.warn(`Authentication failed: success=${result.success}, user_id=${result.user_id}`);
      throw new UnauthorizedException('Unauthorized access');
    }
      
      this.logger.debug(`Authentication successful for user_id: ${result.user_id}`);
    return result.user_id;
    } catch (error) {
      this.logger.error(`requireAuth error: ${error?.message}`);
      this.logger.error(`Error stack: ${error?.stack}`);
      throw error;
    }
  }

  /**
   * Fetch user images from ag_attachment
   */
  private async fetchUserImages(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        id,
        type,
        IF(type = ${this.VIDEOS}, TRUE, FALSE) AS is_video,
        CASE
          WHEN file_path LIKE 'http%' THEN file_path
          ELSE CONCAT(?, file_path)
        END AS file_path
      FROM ag_attachment
      WHERE table_name = ${this.TABLE_USERS} AND row_id = ?
      ORDER BY id ASC
    `;

    const result = await this.dataSource.query(query, [this.baseHost, userId]);

    return result || [];
  }

  /**
   * Normalize Lebanon phone number
   */
  private normalizeLebanonPhone(phone: string, countryCode: string): string {
    const digits = phone.replace(/\D+/g, '');
    if (countryCode === '+961' && digits.length === 7 && digits[0] !== '0') {
      return '0' + digits;
    }
    return digits;
  }

  /**
   * Get languages
   */
  async getLanguages(authToken: string): Promise<any> {
    const userId = await this.requireAuth(authToken);

    const languages = await this.dataSource.query(`
      SELECT id, name, flag_code, shortcut, default_lang
      FROM ag_languages
    `);

    return {
      succeeded: true,
      languages,
    };
  }

  /**
   * Create user (actionCreateUser)
   */
  async createUser(dto: CreateAgUserDto, authUserId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate required fields
      if (!dto.user_name || !dto.user_password || !dto.user_role) {
        throw new BadRequestException('Missing required fields: user_name, user_password, user_role');
      }

      // Check uniqueness
      if (dto.email_address) {
        const existingEmail = await this.agUsersRepository.findOne({
          where: { emailAddress: dto.email_address.trim() },
        });
        if (existingEmail) {
          throw new ConflictException('Email already exists');
        }
      }

      if (dto.phone_number_one) {
        const existingPhone = await this.agUsersRepository.findOne({
          where: { phoneNumberOne: dto.phone_number_one.trim() },
        });
        if (existingPhone) {
          throw new ConflictException('Phone number already exists');
        }
      }

      // Create user
      const userId = this.generateUniqueId();
      const hashedPassword = await bcrypt.hash(dto.user_password, 10);
      const token = this.generateToken();
      const now = new Date();

      const user = this.agUsersRepository.create({
        userId,
        userName: dto.user_name.trim(),
        firstName: dto.first_name?.trim() || null,
        lastName: dto.last_name?.trim() || null,
        userPassword: hashedPassword,
        userRole: dto.user_role,
        emailAddress: dto.email_address?.trim() || null,
        phoneNumberOne: dto.phone_number_one?.trim() || null,
        phoneNumberTwo: dto.phone_number_two?.trim() || null,
        address: dto.address?.trim() || null,
        dateOfBirth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
        country: dto.country_code ? dto.country_code.trim() : null,
        birthPlace: dto.birth_place?.trim() || null,
        description: dto.description?.trim() || null,
        token,
        active: '1',
        centerNum: dto.center_num || 10,
        createdBy: authUserId,
        createdAt: now,
        updatedAt: now,
        userRelatedToCity: 0,
        averageRating: 0.0,
        totalRatings: 0,
        attachmentCounter: 0,
      });

      await queryRunner.manager.save(AgUserEntity, user);

      // Handle cities
      if (dto.cities) {
        let cityIds: number[] = [];
        if (typeof dto.cities === 'string') {
          try {
            cityIds = JSON.parse(dto.cities);
          } catch {
            cityIds = dto.cities.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
          }
        } else if (Array.isArray(dto.cities)) {
          cityIds = dto.cities.map((id) => (typeof id === 'string' ? parseInt(id) : id));
        }

        for (const cityId of cityIds) {
          const userCity = this.agUsersCitiesRepository.create({
            userId,
            cityId,
          });
          await queryRunner.manager.save(AgUserCityEntity, userCity);
        }
      }

      // Handle stores
      let storeIds: string[] = [];
      if (dto.stores) {
        if (typeof dto.stores === 'string') {
          try {
            storeIds = JSON.parse(dto.stores);
          } catch {
            storeIds = dto.stores.split(',').map((id) => id.trim()).filter((id) => id);
          }
        } else if (Array.isArray(dto.stores)) {
          storeIds = dto.stores.map((id) => String(id));
        }
      } else if (dto.store_id) {
        if (typeof dto.store_id === 'string') {
          try {
            storeIds = JSON.parse(dto.store_id);
          } catch {
            storeIds = [dto.store_id];
          }
        } else if (Array.isArray(dto.store_id)) {
          storeIds = dto.store_id.map((id) => String(id));
        }
      }

      for (const storeId of storeIds) {
        if (storeId) {
          const userStore = this.agUserStoresRepository.create({
            userId,
            storeId: String(storeId),
          });
          await queryRunner.manager.save(AgUserStoreEntity, userStore);
        }
      }

      await queryRunner.commitTransaction();

      const { userPassword, ...userData } = user;
      const responseData = { ...userData, token: user.token };

      return {
        succeeded: true,
        data: responseData,
        message: 'User created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user by ID (actionGetUser)
   */
  async getUserById(id: string, authToken: string): Promise<any> {
    await this.requireAuth(authToken);

    const user = await this.agUsersRepository.findOne({
      where: { userId: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const images = await this.fetchUserImages(user.userId);

    const cities = await this.agUsersCitiesRepository.find({
      where: { userId: user.userId },
      select: ['cityId'],
    });

    const stores = await this.agUserStoresRepository.find({
      where: { userId: user.userId },
      select: ['storeId'],
    });

    const { userPassword, ...userData } = user;

    return {
      succeeded: true,
      user: {
        ...userData,
        images,
        cities: cities.map((c) => c.cityId),
        stores: stores.map((s) => s.storeId),
      },
    };
  }

  /**
   * Get all users (actionGetAllUsers)
   */
  async getAllUsers(query: GetAllAgUsersQueryDto, authUserId: string): Promise<any> {
    const startTime = Date.now();
    this.logger.log(`getAllUsers called with authUserId: ${authUserId}`);
    this.logger.debug(`Query parameters: ${JSON.stringify(query)}`);

    try {
      // Check if user is admin
      this.logger.debug(`Checking if user ${authUserId} is admin...`);
      const isAdmin = await this.dataSource.query(`
        SELECT ag_user_groups.group_name
        FROM ag_users
        LEFT JOIN ag_user_groups ON ag_users.user_role = ag_user_groups.id
        WHERE ag_users.user_id = ?
          AND ag_user_groups.group_name = 'Admin'
      `, [authUserId]);

      this.logger.debug(`Is admin check result: ${JSON.stringify(isAdmin)}`);
      const isAdminUser = isAdmin && isAdmin.length > 0;
      this.logger.debug(`User is admin: ${isAdminUser}`);

    const adminCities: number[] = [];
    if (!isAdminUser) {
      // Get admin's cities
      this.logger.debug(`User is not admin, fetching cities for user ${authUserId}...`);
      const cities = await this.agUsersCitiesRepository.find({
        where: { userId: authUserId },
        select: ['cityId'],
      });
      adminCities.push(...cities.map((c) => c.cityId));
      this.logger.debug(`Found ${adminCities.length} cities for non-admin user: ${JSON.stringify(adminCities)}`);
    } else {
      this.logger.debug(`User is admin, no city restrictions applied`);
    }

    // Process city_ids parameter
    let cityIds: number[] | undefined;
    if (query.city_ids) {
      if (typeof query.city_ids === 'string') {
        try {
          cityIds = JSON.parse(query.city_ids);
        } catch {
          if (query.city_ids.includes(',')) {
            cityIds = query.city_ids.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
          } else {
            cityIds = [parseInt(query.city_ids)];
          }
        }
      } else if (typeof query.city_ids === 'number') {
        cityIds = [query.city_ids];
      } else if (Array.isArray(query.city_ids)) {
        cityIds = query.city_ids.map((id) => (typeof id === 'string' ? parseInt(id) : id));
      }
    }

    // Build base query - match Yii exactly using raw SQL
    // Yii uses: AgUsers::find()->alias('u')->select(['u.*', ...])->asArray()->all()
    // Note: store_id doesn't exist in ag_users table (stores are in ag_user_stores junction table)
    // So we list columns explicitly, excluding store_id
    let baseQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.first_name,
        u.last_name,
        u.user_password,
        u.user_role,
        u.email_address,
        u.address,
        u.phone_number_one,
        u.phone_number_two,
        u.date_of_birth,
        u.country,
        u.active,
        u.birth_place,
        u.token,
        u.last_login,
        u.main_image,
        u.last_url,
        u.link,
        u.description,
        u.locked_by,
        u.created_by,
        u.updated_by,
        u.center_num,
        u.attachment_counter,
        u.created_at,
        u.updated_at,
        u.user_related_to_city,
        u.city_id,
        u.average_rating,
        u.total_ratings,
        u.reset_code,
        u.reset_code_date,
        (SELECT c.city_name FROM cities c 
          INNER JOIN ag_users_cities auc ON auc.city_id = c.id 
          WHERE auc.user_id = u.user_id LIMIT 1) AS city_name,
        (SELECT creator.user_name FROM ag_users creator 
          WHERE creator.user_id = u.created_by LIMIT 1) AS created_by_name,
        (SELECT updater.user_name FROM ag_users updater 
          WHERE updater.user_id = u.updated_by LIMIT 1) AS updated_by_name,
        (SELECT g.group_name FROM ag_user_groups g 
          WHERE g.id = u.user_role LIMIT 1) AS role_name
      FROM ag_users u
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    // Apply search filter - match Yii exactly
    if (query.search) {
      this.logger.debug(`Applying search filter: ${query.search}`);
      baseQuery += ` AND (
        u.user_name LIKE ? 
        OR u.first_name LIKE ? 
        OR u.last_name LIKE ? 
        OR u.user_id LIKE ? 
        OR u.phone_number_one LIKE ? 
        OR u.phone_number_two LIKE ? 
        OR u.email_address LIKE ?
      )`;
      const searchPattern = `%${query.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Apply role filter - match Yii exactly
    if (query.role) {
      this.logger.debug(`Applying role filter: ${query.role}`);
      baseQuery += ` AND EXISTS (
          SELECT 1 FROM ag_user_groups g 
          WHERE g.id = u.user_role 
        AND g.group_name = ?
      )`;
      queryParams.push(query.role);
    }

    // Apply city filtering - match Yii exactly
    if (cityIds && cityIds.length > 0) {
      this.logger.debug(`Applying city_ids filter: ${JSON.stringify(cityIds)}`);
      const placeholders = cityIds.map(() => '?').join(',');
      baseQuery += ` AND EXISTS (
          SELECT 1 FROM ag_users_cities auc 
          WHERE auc.user_id = u.user_id 
        AND auc.city_id IN (${placeholders})
      )`;
      queryParams.push(...cityIds);
    } else if (!isAdminUser) {
      if (adminCities.length > 0) {
        this.logger.debug(`Applying admin cities filter: ${JSON.stringify(adminCities)}`);
        const placeholders = adminCities.map(() => '?').join(',');
        baseQuery += ` AND EXISTS (
            SELECT 1 FROM ag_users_cities auc 
            WHERE auc.user_id = u.user_id 
          AND auc.city_id IN (${placeholders})
        )`;
        queryParams.push(...adminCities);
      } else {
        // Non-admin with no cities - return empty - match Yii exactly
        this.logger.warn(`Non-admin user ${authUserId} has no cities assigned, returning empty result`);
        return {
          code: 200,
          succeeded: true,
          users: [],
          pagination: {
            total_count: 0,
            page_count: 0,
            current_page: 1,
            per_page: query.limit || 20,
          },
        };
      }
    }

    // Order by - match Yii: orderBy(new Expression('CAST(created_at AS DATETIME) DESC'))
    baseQuery += ` ORDER BY CAST(u.created_at AS DATETIME) DESC`;

    // Pagination - match Yii: per-page parameter
    const page = query.page || 1;
    // Support both 'limit' and 'per-page' (Yii uses 'per-page')
    const perPage = (query as any)['per-page'] || query.limit || 20;
    const offset = (page - 1) * perPage;

    this.logger.debug(`Executing query with pagination: page=${page}, perPage=${perPage}, offset=${offset}`);
    
    // Get total count - match Yii: $q->count()
    // Build count query by replacing SELECT clause (before adding LIMIT/OFFSET)
    const countQuery = baseQuery
      .replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM')
      .replace(/ORDER BY[\s\S]*$/, ''); // Remove ORDER BY for count
    const countResult = await this.dataSource.query(countQuery, queryParams);
    const totalCount = parseInt(countResult[0]?.total || '0', 10);
    this.logger.debug(`Total count: ${totalCount}`);

    // Apply pagination - match Yii: ->offset($pager->offset)->limit($pager->limit)
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(perPage, offset);
    
    this.logger.debug(`Fetching users with query...`);
    // Execute raw query to get exact column names as in Yii (user_id, user_name, etc.)
    const users = await this.dataSource.query(baseQuery, queryParams);
    this.logger.debug(`Fetched ${users.length} users`);

    // Process user data - match Yii exactly
    // Raw SQL query returns columns with actual DB names (user_id, user_name, etc.) - same as Yii
    this.logger.debug(`Processing ${users.length} users...`);
    for (const user of users) {
      // Raw SQL returns user_id directly (not u_user_id)
      const userId = user.user_id;
      
      if (!userId) {
        this.logger.warn(`Skipping user with no user_id: ${JSON.stringify(Object.keys(user))}`);
        continue;
      }

      // Fetch images - match Yii fetchUserImages
      user.images = await this.fetchUserImages(userId);
      
      // Fetch cities - match Yii exactly
      const cities = await this.agUsersCitiesRepository.find({
        where: { userId },
        select: ['cityId'],
      });
      user.cities = cities.map((c) => c.cityId);

      // Fetch city names - match Yii exactly
      const cityNames = await this.dataSource.query(`
        SELECT c.city_name
        FROM ag_users_cities auc
        INNER JOIN cities c ON auc.city_id = c.id
        WHERE auc.user_id = ?
      `, [userId]);
      user.city_names = cityNames.map((cn: any) => cn.city_name);

      // Get stores - match Yii exactly
      const userStores = await this.dataSource.query(`
        SELECT 
          s.id AS store_id,
          s.store_name,
          s.store_name_ar,
          s.store_type,
          s.store_address,
          s.store_address_ar,
          CASE 
            WHEN a.file_path LIKE 'http%' THEN a.file_path 
            ELSE CONCAT(?, a.file_path) 
          END AS image
        FROM ag_user_stores aus
        INNER JOIN stores s ON s.id = aus.store_id
        LEFT JOIN ag_attachment a ON a.row_id = s.id AND a.table_name = 225
        WHERE aus.user_id = ?
      `, [this.baseHost, userId]);

      // Filter stores by type - match Yii exactly
      user.stores = userStores.filter((store: any) => store.store_type === 'Retail Store');
      user.restaurants = userStores.filter((store: any) => store.store_type === 'Restaurant Store');
    }

    const duration = Date.now() - startTime;
    const pageCount = Math.ceil(totalCount / perPage);
    
    this.logger.log(`getAllUsers completed in ${duration}ms`);
    this.logger.debug(`Returning ${users.length} users out of ${totalCount} total`);
    this.logger.debug(`Pagination: page=${page}, perPage=${perPage}, pageCount=${pageCount}`);

      return {
        code: 200,
        succeeded: true,
        users,
        pagination: {
          total_count: totalCount,
          page_count: pageCount,
          current_page: page,
          per_page: perPage,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`getAllUsers failed after ${duration}ms`);
      this.logger.error(`Error: ${error?.message}`);
      this.logger.error(`Error stack: ${error?.stack}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException(
        `Failed to get users: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update user (actionUpdateUser)
   */
  async updateUser(id: string, dto: UpdateAgUserDto, authUserId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.agUsersRepository.findOne({
        where: { userId: id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check uniqueness (excluding current user)
      if (dto.email_address) {
        const existingEmail = await this.agUsersRepository.findOne({
          where: { emailAddress: dto.email_address.trim() },
        });
        if (existingEmail && existingEmail.userId !== id) {
          throw new ConflictException('Email already exists');
        }
      }

      if (dto.phone_number_one) {
        const existingPhone = await this.agUsersRepository.findOne({
          where: { phoneNumberOne: dto.phone_number_one.trim() },
        });
        if (existingPhone && existingPhone.userId !== id) {
          throw new ConflictException('Phone number already exists');
        }
      }

      // Update user fields
      if (dto.user_name) user.userName = dto.user_name.trim();
      if (dto.first_name !== undefined) user.firstName = dto.first_name?.trim() || null;
      if (dto.last_name !== undefined) user.lastName = dto.last_name?.trim() || null;
      if (dto.email_address !== undefined) user.emailAddress = dto.email_address?.trim() || null;
      if (dto.phone_number_one !== undefined) user.phoneNumberOne = dto.phone_number_one?.trim() || null;
      if (dto.phone_number_two !== undefined) user.phoneNumberTwo = dto.phone_number_two?.trim() || null;
      if (dto.address !== undefined) user.address = dto.address?.trim() || null;
      if (dto.date_of_birth) user.dateOfBirth = new Date(dto.date_of_birth);
      if (dto.country_code) user.country = dto.country_code.trim();
      if (dto.birth_place !== undefined) user.birthPlace = dto.birth_place?.trim() || null;
      if (dto.description !== undefined) user.description = dto.description?.trim() || null;
      if (dto.user_role) user.userRole = dto.user_role;
      if (dto.center_num) user.centerNum = dto.center_num;

      if (dto.user_password) {
        user.userPassword = await bcrypt.hash(dto.user_password, 10);
      }

      user.updatedAt = new Date();
      user.updatedBy = authUserId;

      await queryRunner.manager.save(AgUserEntity, user);

      // Rebuild cities
      await queryRunner.manager.delete(AgUserCityEntity, { userId: id });
      if (dto.cities) {
        let cityIds: number[] = [];
        if (typeof dto.cities === 'string') {
          try {
            cityIds = JSON.parse(dto.cities);
          } catch {
            cityIds = dto.cities.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
          }
        } else if (Array.isArray(dto.cities)) {
          cityIds = dto.cities.map((id) => (typeof id === 'string' ? parseInt(id) : id));
        }

        for (const cityId of cityIds) {
          const userCity = this.agUsersCitiesRepository.create({
            userId: id,
            cityId,
          });
          await queryRunner.manager.save(AgUserCityEntity, userCity);
        }
      }

      // Rebuild stores
      await queryRunner.manager.delete(AgUserStoreEntity, { userId: id });
      let storeIds: string[] = [];
      if (dto.stores) {
        if (typeof dto.stores === 'string') {
          try {
            storeIds = JSON.parse(dto.stores);
          } catch {
            storeIds = dto.stores.split(',').map((id) => id.trim()).filter((id) => id);
          }
        } else if (Array.isArray(dto.stores)) {
          storeIds = dto.stores.map((id) => String(id));
        }
      } else if (dto.store_id) {
        if (typeof dto.store_id === 'string') {
          try {
            storeIds = JSON.parse(dto.store_id);
          } catch {
            storeIds = [dto.store_id];
          }
        } else if (Array.isArray(dto.store_id)) {
          storeIds = dto.store_id.map((id) => String(id));
        }
      }

      for (const storeId of storeIds) {
        if (storeId) {
          const userStore = this.agUserStoresRepository.create({
            userId: id,
            storeId: String(storeId),
          });
          await queryRunner.manager.save(AgUserStoreEntity, userStore);
        }
      }

      await queryRunner.commitTransaction();

      const { userPassword, ...userData } = user;

      return {
        succeeded: true,
        data: userData,
        message: 'User updated',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete user(s) (actionDeleteUser)
   */
  async deleteUser(dto: DeleteAgUserDto, authUserId: string): Promise<any> {
    let userIds: string[] = [];

    // Normalize user IDs
    if (typeof dto.id === 'string') {
      try {
        userIds = JSON.parse(dto.id);
      } catch {
        if (dto.id.includes(',')) {
          userIds = dto.id.split(',').map((id) => id.trim()).filter((id) => id);
        } else {
          userIds = [dto.id];
        }
      }
    } else if (Array.isArray(dto.id)) {
      userIds = dto.id.map((id) => String(id));
    }

    userIds = [...new Set(userIds.map((id) => String(id)))];

    if (userIds.length === 0) {
      throw new BadRequestException('Invalid user_ids format, must be an array');
    }

    // Check if any user is linked to stores
    for (const userId of userIds) {
      const user = await this.agUsersRepository.findOne({
        where: { userId },
      });

      if (!user) {
        throw new NotFoundException(`User not found (ID: ${userId})`);
      }

      const hasUserStores = await this.agUserStoresRepository.count({
        where: { userId },
      }) > 0;

      const hasInvolvedStores = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM store_involved_users WHERE user_id = ?
      `, [userId]).then((result: any[]) => result[0]?.count > 0);

      if (hasUserStores || hasInvolvedStores) {
        throw new ConflictException('User cannot be deleted because they are linked to stores.');
      }
    }

    // Delete users
    for (const userId of userIds) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Delete attachments
        await queryRunner.query(`
          DELETE FROM ag_attachment 
          WHERE table_name = ${this.TABLE_USERS} AND row_id = ?
        `, [userId]);

        // Log deleted record
        const tableId = await queryRunner.query(`
          SELECT id FROM ag_tables_schema WHERE table_name = 'ag_users'
        `).then((result: any[]) => result[0]?.id);

        if (tableId) {
          const user = await this.agUsersRepository.findOne({ where: { userId } });
          await queryRunner.query(`
            INSERT INTO ag_deleted_records (table_id, row_id, created_by, center_num)
            VALUES (?, ?, ?, ?)
          `, [tableId, userId, authUserId || 'system', user?.centerNum || 10]);
        }

        await queryRunner.manager.delete(AgUserEntity, { userId });
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(`Delete failed: ${error.message}`);
      } finally {
        await queryRunner.release();
      }
    }

    return {
      succeeded: true,
      message: 'Deleted successfully',
    };
  }

  /**
   * Login (actionLogin)
   */
  async login(dto: LoginAgUserDto): Promise<any> {
    const login = dto.login.trim();
    const password = dto.password.trim();

    if (!login || !password) {
      throw new BadRequestException('Both login and password are required');
    }

    // Use raw query to avoid selecting store_id which doesn't exist in ag_users table
    const userResult = await this.dataSource.query(`
      SELECT 
        user_id,
        user_name,
        first_name,
        last_name,
        user_password,
        user_role,
        email_address,
        address,
        phone_number_one,
        phone_number_two,
        date_of_birth,
        country,
        active,
        birth_place,
        token,
        last_login,
        main_image,
        last_url,
        link,
        description,
        locked_by,
        created_by,
        updated_by,
        center_num,
        attachment_counter,
        created_at,
        updated_at,
        user_related_to_city,
        city_id,
        average_rating,
        total_ratings,
        reset_code,
        reset_code_date
      FROM ag_users
      WHERE email_address = ? OR phone_number_one = ? OR phone_number_two = ?
      LIMIT 1
    `, [login, login, login]);

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException('User not found');
    }

    const rawUserData = userResult[0];
    const user = {
      userId: rawUserData.user_id,
      userName: rawUserData.user_name,
      firstName: rawUserData.first_name,
      lastName: rawUserData.last_name,
      userPassword: rawUserData.user_password,
      userRole: rawUserData.user_role,
      emailAddress: rawUserData.email_address,
      address: rawUserData.address,
      phoneNumberOne: rawUserData.phone_number_one,
      phoneNumberTwo: rawUserData.phone_number_two,
      dateOfBirth: rawUserData.date_of_birth,
      country: rawUserData.country,
      active: rawUserData.active,
      birthPlace: rawUserData.birth_place,
      token: rawUserData.token,
      lastLogin: rawUserData.last_login,
      mainImage: rawUserData.main_image,
      lastUrl: rawUserData.last_url,
      link: rawUserData.link,
      description: rawUserData.description,
      lockedBy: rawUserData.locked_by,
      createdBy: rawUserData.created_by,
      updatedBy: rawUserData.updated_by,
      centerNum: rawUserData.center_num,
      attachmentCounter: rawUserData.attachment_counter,
      createdAt: rawUserData.created_at,
      updatedAt: rawUserData.updated_at,
      userRelatedToCity: rawUserData.user_related_to_city,
      cityId: rawUserData.city_id,
      averageRating: rawUserData.average_rating,
      totalRatings: rawUserData.total_ratings,
      resetCode: rawUserData.reset_code,
      resetCodeDate: rawUserData.reset_code_date,
    };

    // Yii uses PHP bcrypt format ($2y$) which needs special handling
    // Convert $2y$ to $2b$ format for Node.js bcrypt compatibility
    let passwordHash = user.userPassword;
    if (passwordHash && passwordHash.startsWith('$2y$')) {
      passwordHash = passwordHash.replace('$2y$', '$2b$');
    }
    
    // Use bcryptjs (synchronous) - better PHP bcrypt compatibility
    // bcryptjs can handle $2y$ format directly, but converting to $2b$ is safer
    const isPasswordValid = bcryptjs.compareSync(password, passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    if (user.active !== '1') {
      throw new UnauthorizedException('Account is not active');
    }

    // Get permissions
    const permissions = await this.dataSource.query(`
      SELECT 
        p.table_name,
        g.group_name,
        g.group_description,
        permissions.create,
        permissions.update,
        permissions.delete,
        permissions.view
      FROM ag_permissions permissions
      LEFT JOIN ag_tables_schema p ON p.id = permissions.table_id
      LEFT JOIN ag_user_groups g ON g.id = permissions.group_id
      WHERE permissions.user_id = ? OR permissions.group_id = ?
    `, [user.userId, user.userRole]);

    // Organize permissions
    const organizedPermissions: Record<string, any> = {};
    for (const perm of permissions) {
      const tableName = perm.table_name;
      if (!organizedPermissions[tableName]) {
        organizedPermissions[tableName] = {
          table_name: tableName,
          group_name: perm.group_name,
          group_description: perm.group_description,
          create: Boolean(perm.create),
          update: Boolean(perm.update),
          delete: Boolean(perm.delete),
          view: Boolean(perm.view),
        };
      } else {
        organizedPermissions[tableName].create = organizedPermissions[tableName].create || Boolean(perm.create);
        organizedPermissions[tableName].update = organizedPermissions[tableName].update || Boolean(perm.update);
        organizedPermissions[tableName].delete = organizedPermissions[tableName].delete || Boolean(perm.delete);
        organizedPermissions[tableName].view = organizedPermissions[tableName].view || Boolean(perm.view);
      }
    }

    // Get main image
    const mainImage = await this.dataSource.query(`
      SELECT file_path
      FROM ag_attachment
      WHERE table_name = ${this.TABLE_USERS} AND row_id = ? AND type = 1
      LIMIT 1
    `, [user.userId]).then((result: any[]) => result[0]?.file_path || null);

    // Update token - use raw query to update
    const newToken = this.generateToken();
    await this.dataSource.query(`
      UPDATE ag_users 
      SET token = ?, updated_at = NOW()
      WHERE user_id = ?
    `, [newToken, user.userId]);

    // Prepare response data - exclude password and token from user object
    const { userPassword, ...userData } = user;
    const responseData = { 
      ...userData, 
      main_image: mainImage,
      // Token is NOT included in user object per user requirement
    };

    return {
      succeeded: true,
      message: 'Login successful',
      user: responseData,
      token: newToken, // Return token separately (not in user object) for authentication
      permissions: Object.values(organizedPermissions),
    };
  }

  /**
   * Change password (actionChangePassword)
   */
  async changePassword(dto: ChangePasswordAgUserDto, authUserId: string): Promise<any> {
    const user = await this.agUsersRepository
      .createQueryBuilder('u')
      .addSelect('u.userPassword')
      .where('u.userId = :userId', { userId: authUserId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.current_password, user.userPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.new_password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const isSamePassword = await bcrypt.compare(dto.new_password, user.userPassword);
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be same as current password');
    }

    user.userPassword = await bcrypt.hash(dto.new_password, 10);
    user.updatedAt = new Date();
    user.updatedBy = authUserId;
    await this.agUsersRepository.save(user);

    return {
      succeeded: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Forgot password (actionForgetPassword)
   */
  async forgotPassword(dto: ForgotPasswordAgUserDto): Promise<any> {
    const phoneNumber = this.normalizeLebanonPhone(
      dto.phone_number,
      dto.country_code || '+961',
    );

    const user = await this.agUsersRepository.findOne({
      where: {
        phoneNumberOne: phoneNumber,
        active: '1',
      },
      order: { createdAt: 'DESC' },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const currentDate = new Date();
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));

    const count = await this.dataSource.query(`
      SELECT COUNT(*) as count
      FROM sms_data
      WHERE phone_number = ? AND send_date BETWEEN ? AND ?
    `, [phoneNumber, todayStart, todayEnd]).then((result: any[]) => result[0]?.count || 0);

    const canSend =
      count < this.RESEND_COUNT &&
      (!user.resetCode ||
        !user.resetCodeDate ||
        (Date.now() - new Date(user.resetCodeDate).getTime()) / 1000 >= this.RESEND_TIME);

    if (!canSend) {
      throw new BadRequestException('Maximum SMS limit Reached or Couldn\'t Send Activation Code');
    }

    const code = this.generateCode();
    const token = this.generateToken();
    user.resetCode = code;
    user.resetCodeDate = new Date();
    user.token = token;
    await this.agUsersRepository.save(user);

    // TODO: Implement SMS sending
    // const smsSent = await this.sendSMS(phoneNumber, dto.country_code || '+961', code);

    return {
      succeeded: true,
      message: 'Reset Code Sent Successfully',
    };
  }

  /**
   * Check reset code (actionCheckResetCode)
   */
  async checkResetCode(dto: CheckResetCodeAgUserDto): Promise<any> {
    const phoneNumber = this.normalizeLebanonPhone(
      dto.phone_number,
      dto.country_code || '+961',
    );

    const user = await this.agUsersRepository.findOne({
      where: {
        phoneNumberOne: phoneNumber,
        active: '1',
      },
      order: { createdAt: 'DESC' },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    if (dto.code !== user.resetCode) {
      throw new NotFoundException('Invalid code');
    }

    if (!user.resetCodeDate) {
      throw new BadRequestException('Code not found or has expired');
    }

    const age = (Date.now() - new Date(user.resetCodeDate).getTime()) / 1000;
    if (age < 0 || age > this.EXPIRY_TIME) {
      throw new BadRequestException('Active Code Expired');
    }

    return {
      succeeded: true,
      message: 'Reset Code Checked Successfully',
    };
  }

  /**
   * Reset password (actionResetPassword)
   */
  async resetPassword(dto: ResetPasswordAgUserDto): Promise<any> {
    const phoneNumber = this.normalizeLebanonPhone(
      dto.phone_number,
      dto.country_code || '+961',
    );

    const user = await this.agUsersRepository.findOne({
      where: {
        phoneNumberOne: phoneNumber,
        active: '1',
      },
      order: { createdAt: 'DESC' },
    });

    if (!user) {
      throw new NotFoundException('Invalid Credentials or Account not Activated.');
    }

    if (!user.resetCode || !user.resetCodeDate) {
      throw new BadRequestException('Code not found or has expired.');
    }

    user.userPassword = await bcrypt.hash(dto.user_password, 10);
    user.resetCode = null;
    user.resetCodeDate = null;
    user.token = this.generateToken();
    await this.agUsersRepository.save(user);

    // Get user data
    const userData = await this.getUserData(dto.country_code || '+961', phoneNumber);

    return {
      succeeded: true,
      message: 'Password Reset Successfully',
      user: userData,
      table_name: 'ag_users',
      main_image_type: 1,
      token: user.token,
    };
  }

  /**
   * Get user data helper
   */
  private async getUserData(countryCode: string | null, phoneNumber: string): Promise<any> {
    const userDetails = await this.dataSource.query(`
      SELECT 
        u.user_id AS id,
        u.first_name,
        u.last_name,
        u.phone_number_one AS phone_number,
        u.country AS country_code,
        u.email_address AS email,
        u.date_of_birth AS birth_date,
        u.address,
        u.city_id,
        u.province_id,
        u.token,
        mc.id AS main_city_id
      FROM ag_users u
      LEFT JOIN user_cities uc ON uc.user_id = u.user_id AND uc.main_city = 1
      LEFT JOIN cities mc ON mc.id = uc.city_id
      WHERE u.phone_number_one = ? AND u.active = 1
    `, [phoneNumber]).then((result: any[]) => result[0] || null);

    if (!userDetails) {
      return null;
    }

    // Get image
    const image = await this.dataSource.query(`
      SELECT file_path
      FROM ag_attachment
      WHERE table_name = ${this.TABLE_USERS} AND type = 1 AND row_id = ?
      LIMIT 1
    `, [userDetails.id]).then((result: any[]) => result[0]?.file_path || null);

    userDetails.image = image;

    // Get province
    if (userDetails.province_id) {
      const province = await this.dataSource.query(`
        SELECT province FROM province WHERE id = ?
      `, [userDetails.province_id]).then((result: any[]) => result[0]?.province || null);
      userDetails.province = province;
    }

    // Get city
    if (userDetails.main_city_id) {
      const city = await this.dataSource.query(`
        SELECT city_name FROM cities WHERE id = ?
      `, [userDetails.main_city_id]).then((result: any[]) => result[0]?.city_name || null);
      userDetails.city = city;
    }

    // Get all cities
    const citiesList = await this.dataSource.query(`
      SELECT uc.city_id, c.city_name
      FROM ag_users_cities uc
      LEFT JOIN cities c ON c.id = uc.city_id
      WHERE uc.user_id = ?
    `, [userDetails.id]);

    userDetails.cities = citiesList;
    userDetails.has_cities = citiesList.length > 0;

    return userDetails;
  }

  /**
   * Get permissions (actionGetPermissions)
   */
  async getPermissions(authUserId: string): Promise<any> {
    const user = await this.agUsersRepository.findOne({
      where: { userId: authUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedKeys: Record<string, string> = {
      admin_dashboard: 'Admin Dashboard',
      municipality_dashboard: 'Municipality Dashboard',
      users: 'Users',
      dashboard_users: 'Dashboard Users',
      municipality: 'Municipality',
      news: 'News',
      breaking_news: 'Breaking News',
      news_categories: 'News Categories',
      stores: 'Stores',
      store_categories: 'Store Categories',
      restaurants: 'Restaurants',
      restaurant_categories: 'Restaurant Categories',
      buy_sell: 'Buy & Sell',
      buy_sell_categories: 'Buy & Sell Categories',
      buy_sell_slider: 'Buy & Sell Slider',
      lost_items: 'Lost Items',
      found_items: 'Found Items',
      lost_found_categories: 'Lost & Found Categories',
      delivery_men: 'Delivery Men',
      delivery_categories: 'Delivery Categories',
      notifications: 'Announcements',
      suggestions_claims: 'Suggestions & Claims',
      suggestions_claims_categories: 'Suggestions & Claims Categories',
      slider_data: 'Homepage Slider',
      modules: 'Modules',
      ag_user_groups: 'Roles',
      user_requests: 'User Requests',
      prof_categories: 'Professions Categories',
      professions: 'Professions',
      sos: 'SOS',
      reports: 'Reports',
      reports_categories: 'Reports Categories',
    };

    const lookupMap: Record<string, string> = {
      delivery_categories: 'delivery_cat',
      dashboard_users: 'ag_users',
      user_requests: 'user_requests',
    };

    const groupName = await this.dataSource.query(`
      SELECT group_name FROM ag_user_groups WHERE id = ?
    `, [user.userRole]).then((result: any[]) => result[0]?.group_name || null);

    const tablesForDb = Object.keys(allowedKeys).map((key) => lookupMap[key] || key);

    const permissions = await this.dataSource.query(`
      SELECT 
        p.table_name,
        g.group_name,
        g.group_description,
        permissions.create,
        permissions.update,
        permissions.delete,
        permissions.view
      FROM ag_permissions permissions
      LEFT JOIN ag_tables_schema p ON p.id = permissions.table_id
      LEFT JOIN ag_user_groups g ON g.id = permissions.group_id
      WHERE (permissions.user_id = ? OR permissions.group_id = ?)
        AND p.table_name IN (?)
    `, [user.userId, user.userRole, tablesForDb]);

    const organizedPermissions: Record<string, any> = {};

    for (const [key, title] of Object.entries(allowedKeys)) {
      const permissionsSet: any = {
        table_name: key,
        title,
        group_name: groupName,
        group_description: null,
        create: false,
        update: false,
        delete: false,
        view: false,
      };

      const lookupKey = lookupMap[key] || key;

      for (const perm of permissions) {
        if (perm.table_name?.toLowerCase() === lookupKey.toLowerCase()) {
          if (!permissionsSet.group_description) {
            permissionsSet.group_description = perm.group_description;
          }
          permissionsSet.create = permissionsSet.create || Boolean(perm.create);
          permissionsSet.update = permissionsSet.update || Boolean(perm.update);
          permissionsSet.delete = permissionsSet.delete || Boolean(perm.delete);
          permissionsSet.view = permissionsSet.view || Boolean(perm.view);
        }
      }

      organizedPermissions[key] = permissionsSet;
    }

    return {
      succeeded: true,
      user_id: user.userId,
      permissions: Object.values(organizedPermissions),
    };
  }
}
