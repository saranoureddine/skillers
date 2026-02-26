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
import { CityMemberEntity } from '../entities/city-member.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  CreateCityMemberDto,
  GetCityMemberDto,
  UpdateCityMemberDto,
  GetAllCityMembersDto,
  DeleteCityMemberDto,
} from '../dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Public CitiesMembers service — handles all city members endpoints matching Yii API
 */
@Injectable()
export class CitiesMembersPublicService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(CityMemberEntity)
    private readonly cityMembersRepository: Repository<CityMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
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
   * Generate unique ID (20 characters)
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Extract user ID from user object
   */
  private extractUserId(user: UserEntity): string {
    return user.id;
  }

  /**
   * Create city member (actionCreateCityMember)
   * Matches Yii implementation exactly
   */
  async createCityMember(
    userId: string,
    dto: CreateCityMemberDto,
  ): Promise<any> {
    try {
      const member = this.cityMembersRepository.create({
        id: this.generateUniqueId(),
        cityId: dto.city_id,
        name: dto.name,
        fromYear: dto.from_year,
        isActive: dto.is_active ?? 1,
        createdAt: new Date(),
        createdBy: userId,
        centerNum: dto.center_num ?? 1,
        administrationTermId: dto.administration_term_id || null,
        nameAr: dto.name_ar || null,
        positionId: dto.position_id || null,
        email: dto.email || null,
        departmentId: dto.department_id || null,
        biography: dto.biography || null,
        toYear: dto.to_year || null,
        phoneNumber: dto.phone_number || null,
        orderNumber: dto.order_number || null,
        mainImage: dto.main_image || null,
      } as Partial<CityMemberEntity>);

      await this.cityMembersRepository.save(member);

      return {
        succeeded: true,
        data: {
          id: member.id,
          city_id: member.cityId,
          name: member.name,
          name_ar: member.nameAr,
          position_id: member.positionId,
          email: member.email,
          department_id: member.departmentId,
          is_active: member.isActive,
          biography: member.biography,
          from_year: member.fromYear,
          to_year: member.toYear,
          phone_number: member.phoneNumber,
          order_number: member.orderNumber,
          main_image: member.mainImage,
          administration_term_id: member.administrationTermId,
          locked_by: member.lockedBy,
          created_by: member.createdBy,
          updated_by: member.updatedBy,
          center_num: member.centerNum,
          created_at: member.createdAt,
          updated_at: member.updatedAt,
          attachment_counter: member.attachmentCounter,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create city member: ' + error.message,
      );
    }
  }

  /**
   * Get city member (actionGetCityMember)
   * Matches Yii implementation exactly
   */
  async getCityMember(dto: GetCityMemberDto): Promise<any> {
    try {
      const member = await this.cityMembersRepository.findOne({
        where: { id: dto.id },
      });

      if (!member) {
        throw new NotFoundException('City member not found');
      }

      return {
        succeeded: true,
        member: {
          id: member.id,
          city_id: member.cityId,
          name: member.name,
          name_ar: member.nameAr,
          role: member.role,
          position_id: member.positionId,
          email: member.email,
          department_id: member.departmentId,
          is_active: member.isActive,
          biography: member.biography,
          from_year: member.fromYear,
          to_year: member.toYear,
          phone_number: member.phoneNumber,
          order_number: member.orderNumber,
          main_image: member.mainImage,
          administration_term_id: member.administrationTermId,
          locked_by: member.lockedBy,
          created_by: member.createdBy,
          updated_by: member.updatedBy,
          center_num: member.centerNum,
          created_at: member.createdAt,
          updated_at: member.updatedAt,
          attachment_counter: member.attachmentCounter,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get city member: ' + error.message,
      );
    }
  }

  /**
   * Update city member (actionUpdateCityMember)
   * Matches Yii implementation exactly
   */
  async updateCityMember(
    userId: string,
    dto: UpdateCityMemberDto,
  ): Promise<any> {
    try {
      const member = await this.cityMembersRepository.findOne({
        where: { id: dto.id },
      });

      if (!member) {
        throw new NotFoundException('City member not found');
      }

      // Update fields if provided
      if (dto.city_id !== undefined) member.cityId = dto.city_id;
      if (dto.name !== undefined) member.name = dto.name;
      if (dto.name_ar !== undefined) member.nameAr = dto.name_ar;
      if (dto.from_year !== undefined) member.fromYear = dto.from_year;
      if (dto.to_year !== undefined) member.toYear = dto.to_year;
      if (dto.phone_number !== undefined) member.phoneNumber = dto.phone_number;
      if (dto.order_number !== undefined) member.orderNumber = dto.order_number;
      if (dto.main_image !== undefined) member.mainImage = dto.main_image;
      if (dto.position_id !== undefined) member.positionId = dto.position_id;
      if (dto.email !== undefined) member.email = dto.email;
      if (dto.department_id !== undefined) member.departmentId = dto.department_id;
      if (dto.is_active !== undefined) member.isActive = dto.is_active;
      if (dto.biography !== undefined) member.biography = dto.biography;

      member.updatedAt = new Date();
      member.updatedBy = userId;

      await this.cityMembersRepository.save(member);

      return {
        succeeded: true,
        member: {
          id: member.id,
          city_id: member.cityId,
          name: member.name,
          name_ar: member.nameAr,
          role: member.role,
          position_id: member.positionId,
          email: member.email,
          department_id: member.departmentId,
          is_active: member.isActive,
          biography: member.biography,
          from_year: member.fromYear,
          to_year: member.toYear,
          phone_number: member.phoneNumber,
          order_number: member.orderNumber,
          main_image: member.mainImage,
          administration_term_id: member.administrationTermId,
          locked_by: member.lockedBy,
          created_by: member.createdBy,
          updated_by: member.updatedBy,
          center_num: member.centerNum,
          created_at: member.createdAt,
          updated_at: member.updatedAt,
          attachment_counter: member.attachmentCounter,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update city member: ' + error.message,
      );
    }
  }

  /**
   * Get all city members (actionGetAllCityMembers)
   * Matches Yii implementation exactly
   */
  async getAllCityMembers(dto: GetAllCityMembersDto): Promise<any> {
    try {
      const page = dto.page || 1;
      const perPage = dto['per-page'] || 20;
      const offset = (page - 1) * perPage;

      // Build query
      let query = this.dataSource
        .createQueryBuilder()
        .select([
          'cities_members.id',
          'cities_members.city_id',
          'cities_members.name',
          'cities_members.name_ar',
          'cities_members.role',
          'cities_members.position_id',
          'cities_members.email',
          'cities_members.department_id',
          'cities_members.is_active',
          'cities_members.biography',
          'cities_members.from_year',
          'cities_members.to_year',
          'cities_members.phone_number',
          'cities_members.order_number',
          'cities_members.main_image',
          'cities_members.administration_term_id',
          'cities_members.locked_by',
          'cities_members.created_by',
          'cities_members.updated_by',
          'cities_members.center_num',
          'cities_members.created_at',
          'cities_members.updated_at',
          'cities_members.attachment_counter',
        ])
        .from(CityMemberEntity, 'cities_members');

      // Filter by city_id if provided
      if (dto.city_id) {
        query = query.where('cities_members.city_id = :cityId', {
          cityId: dto.city_id,
        });
      }

      // Join with positions table for custom ordering
      query = query.leftJoin(
        'city_members_positions',
        'cmp',
        'cmp.id = cities_members.position_id',
      );

      // Add position order as a select field for ordering
      query = query.addSelect(
        `CASE 
          WHEN cmp.position_name_en = 'Mayor' THEN 0
          WHEN cmp.position_name_en = 'President' THEN 1
          WHEN cmp.position_name_en = 'Vice President' THEN 2
          WHEN cmp.position_name_en = 'President assistant' THEN 3
          ELSE 4
        END`,
        'position_order',
      );

      // Get total count before pagination (need to clone query for count)
      const countQuery = this.dataSource
        .createQueryBuilder()
        .from(CityMemberEntity, 'cities_members');
      if (dto.city_id) {
        countQuery.where('cities_members.city_id = :cityId', {
          cityId: dto.city_id,
        });
      }
      const totalCount = await countQuery.getCount();

      // Apply custom ordering (Mayor first, then President, etc.)
      query = query
        .orderBy('position_order', 'ASC')
        .addOrderBy('cities_members.order_number', 'ASC')
        .addOrderBy('cities_members.name', 'ASC')
        .offset(offset)
        .limit(perPage);

      const rows = await query.getRawMany();

      // Fetch images from ag_attachment table (table_name = 217)
      const memberIds = rows.map((row) => row.id);
      let attachmentsMap: Record<string, string> = {};

      if (memberIds.length > 0) {
        const attachments = await this.dataSource
          .createQueryBuilder()
          .select(['row_id AS member_id', 'file_path'])
          .from('ag_attachment', 'ag_attachment')
          .where('ag_attachment.table_name = :tableName', { tableName: '217' })
          .andWhere('ag_attachment.row_id IN (:...memberIds)', { memberIds })
          .groupBy('ag_attachment.row_id')
          .getRawMany();

        attachments.forEach((attachment) => {
          let filePath = attachment.file_path;
          if (
            !filePath.startsWith('http://') &&
            !filePath.startsWith('https://')
          ) {
            filePath = `${this.baseHost.replace(/\/+$/, '')}/${filePath.replace(/^\/+/, '')}`;
          }
          attachmentsMap[attachment.member_id] = filePath;
        });
      }

      // Add image to each member
      const members = rows.map((row) => ({
        ...row,
        image: attachmentsMap[row.id] || null,
      }));

      return {
        succeeded: true,
        members: members,
        pagination: {
          total_count: totalCount,
          page_count: Math.ceil(totalCount / perPage),
          current_page: page,
          per_page: perPage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get all city members: ' + error.message,
      );
    }
  }

  /**
   * Delete city member (actionDeleteCityMember)
   * Matches Yii implementation exactly
   */
  async deleteCityMember(dto: DeleteCityMemberDto): Promise<any> {
    try {
      const member = await this.cityMembersRepository.findOne({
        where: { id: dto.id },
      });

      if (!member) {
        throw new NotFoundException('City member not found');
      }

      await this.cityMembersRepository.remove(member);

      return {
        succeeded: true,
        message: 'City member deleted',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete city member: ' + error.message,
      );
    }
  }
}
