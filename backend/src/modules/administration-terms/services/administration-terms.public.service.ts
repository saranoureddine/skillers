import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AdministrationTermEntity } from '../entities/administration-term.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  CreateAdministrationTermDto,
  UpdateAdministrationTermDto,
  GetAdministrationTermDto,
  GetAllAdministrationTermsDto,
  DeleteAdministrationTermDto,
} from '../dto';
import * as crypto from 'crypto';

/**
 * Public/user-facing service — handles all administration terms endpoints matching Yii API
 */
@Injectable()
export class AdministrationTermsPublicService {
  constructor(
    @InjectRepository(AdministrationTermEntity)
    private readonly administrationTermsRepository: Repository<AdministrationTermEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Generate unique 20-character ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Create administration term (actionCreateAdministrationTerm)
   * Matches Yii implementation exactly
   */
  async createAdministrationTerm(
    createdBy: string,
    dto: CreateAdministrationTermDto,
  ): Promise<any> {
    try {
      // Check for duplicate term (city_id + from_year + to_year)
      const existing = await this.administrationTermsRepository.findOne({
        where: {
          cityId: dto.cityId,
          fromYear: dto.fromYear,
          toYear: dto.toYear,
        },
      });

      if (existing) {
        throw new ConflictException(
          'An administration term for this city and time period already exists.',
        );
      }

      // Auto-swap years if from_year > to_year
      let fromYear = dto.fromYear;
      let toYear = dto.toYear;
      if (fromYear > toYear) {
        [fromYear, toYear] = [toYear, fromYear];
      }

      // Convert empty strings to null for optional fields
      const titleEn = dto.titleEn === '' ? null : dto.titleEn || null;
      const titleAr = dto.titleAr === '' ? null : dto.titleAr || null;
      const descriptionEn =
        dto.descriptionEn === '' ? null : dto.descriptionEn || null;
      const descriptionAr =
        dto.descriptionAr === '' ? null : dto.descriptionAr || null;

      // Create term
      const term = this.administrationTermsRepository.create({
        id: this.generateUniqueId(),
        cityId: dto.cityId,
        fromYear,
        toYear,
        isActive: dto.isActive ? 1 : 0,
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        createdBy,
        updatedBy: null,
      } as Partial<AdministrationTermEntity>);

      await this.administrationTermsRepository.save(term);

      return {
        succeeded: true,
        term: {
          id: term.id,
          city_id: term.cityId,
          from_year: term.fromYear,
          to_year: term.toYear,
          is_active: term.isActive,
          title_en: term.titleEn,
          title_ar: term.titleAr,
          description_en: term.descriptionEn,
          description_ar: term.descriptionAr,
          created_by: term.createdBy,
          updated_by: term.updatedBy,
          created_at: term.createdAt,
          updated_at: term.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create administration term: ' + error.message,
      );
    }
  }

  /**
   * Update administration term (actionUpdateAdministrationTerm)
   * Matches Yii implementation exactly
   */
  async updateAdministrationTerm(
    id: string,
    updatedBy: string,
    dto: UpdateAdministrationTermDto,
  ): Promise<any> {
    try {
      const term = await this.administrationTermsRepository.findOne({
        where: { id },
      });

      if (!term) {
        throw new NotFoundException('Not found');
      }

      // Update fields if provided
      if (dto.cityId !== undefined) term.cityId = dto.cityId;
      if (dto.fromYear !== undefined) term.fromYear = dto.fromYear;
      if (dto.toYear !== undefined) term.toYear = dto.toYear;
      if (dto.isActive !== undefined) term.isActive = dto.isActive ? 1 : 0;
      if (dto.titleEn !== undefined)
        term.titleEn = dto.titleEn === '' ? null : dto.titleEn || null;
      if (dto.titleAr !== undefined)
        term.titleAr = dto.titleAr === '' ? null : dto.titleAr || null;
      if (dto.descriptionEn !== undefined)
        term.descriptionEn =
          dto.descriptionEn === '' ? null : dto.descriptionEn || null;
      if (dto.descriptionAr !== undefined)
        term.descriptionAr =
          dto.descriptionAr === '' ? null : dto.descriptionAr || null;

      // Auto-swap years if from_year > to_year
      if (term.fromYear > term.toYear) {
        [term.fromYear, term.toYear] = [term.toYear, term.fromYear];
      }

      term.updatedBy = updatedBy;
      await this.administrationTermsRepository.save(term);

      return {
        succeeded: true,
        term: {
          id: term.id,
          city_id: term.cityId,
          from_year: term.fromYear,
          to_year: term.toYear,
          is_active: term.isActive,
          title_en: term.titleEn,
          title_ar: term.titleAr,
          description_en: term.descriptionEn,
          description_ar: term.descriptionAr,
          created_by: term.createdBy,
          updated_by: term.updatedBy,
          created_at: term.createdAt,
          updated_at: term.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update administration term: ' + error.message,
      );
    }
  }

  /**
   * Get administration term (actionGetAdministrationTerm)
   * Matches Yii implementation exactly
   */
  async getAdministrationTerm(dto: GetAdministrationTermDto): Promise<any> {
    try {
      const term = await this.administrationTermsRepository.findOne({
        where: { id: dto.id },
      });

      if (!term) {
        throw new NotFoundException('Not found');
      }

      return {
        succeeded: true,
        term: {
          id: term.id,
          city_id: term.cityId,
          from_year: term.fromYear,
          to_year: term.toYear,
          is_active: term.isActive,
          title_en: term.titleEn,
          title_ar: term.titleAr,
          description_en: term.descriptionEn,
          description_ar: term.descriptionAr,
          created_by: term.createdBy,
          updated_by: term.updatedBy,
          created_at: term.createdAt,
          updated_at: term.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get administration term: ' + error.message,
      );
    }
  }

  /**
   * Get all administration terms (actionGetAllAdministrationTerms)
   * Matches Yii implementation exactly
   */
  async getAllAdministrationTerms(
    dto: GetAllAdministrationTermsDto,
  ): Promise<any> {
    try {
      const page = dto.page || 1;
      const perPage = dto.perPage || 20;
      const offset = (page - 1) * perPage;

      // Get total count
      const totalCount = await this.administrationTermsRepository.count();

      // Get paginated terms
      const terms = await this.administrationTermsRepository.find({
        order: {
          fromYear: 'DESC',
          toYear: 'DESC',
        },
        skip: offset,
        take: perPage,
      });

      const termsData = terms.map((term) => ({
        id: term.id,
        city_id: term.cityId,
        from_year: term.fromYear,
        to_year: term.toYear,
        is_active: term.isActive,
        title_en: term.titleEn,
        title_ar: term.titleAr,
        description_en: term.descriptionEn,
        description_ar: term.descriptionAr,
        created_by: term.createdBy,
        updated_by: term.updatedBy,
        created_at: term.createdAt,
        updated_at: term.updatedAt,
      }));

      const pageCount = Math.ceil(totalCount / perPage);

      return {
        succeeded: true,
        terms: termsData,
        pagination: {
          total_count: totalCount,
          page_count: pageCount,
          current_page: page,
          per_page: perPage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get administration terms: ' + error.message,
      );
    }
  }

  /**
   * Delete administration term (actionDeleteAdministrationTerm)
   * Matches Yii implementation exactly - also deletes related CitiesMembers
   */
  async deleteAdministrationTerm(dto: DeleteAdministrationTermDto): Promise<any> {
    try {
      const term = await this.administrationTermsRepository.findOne({
        where: { id: dto.id },
      });

      if (!term) {
        throw new NotFoundException('Not found');
      }

      // Delete all CitiesMembers that belong to the same city and term years
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from('cities_members')
        .where('from_year = :fromYear', { fromYear: term.fromYear })
        .andWhere('to_year = :toYear', { toYear: term.toYear })
        .andWhere('city_id = :cityId', { cityId: term.cityId })
        .execute();

      // Delete the administration term itself
      await this.administrationTermsRepository.remove(term);

      return {
        succeeded: true,
        message: 'Term and members deleted',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete administration term: ' + error.message,
      );
    }
  }
}
