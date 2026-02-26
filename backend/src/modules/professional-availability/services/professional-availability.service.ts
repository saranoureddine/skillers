import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProfessionalAvailabilityEntity, DayOfWeek } from '../entities/professional-availability.entity';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

/**
 * Shared professional availability service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfessionalAvailabilityService {
  constructor(
    @InjectRepository(ProfessionalAvailabilityEntity)
    private readonly availabilityRepository: Repository<ProfessionalAvailabilityEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find availability by ID
   */
  async findById(id: number): Promise<ProfessionalAvailabilityEntity> {
    const availability = await this.availabilityRepository.findOne({ where: { id } });
    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }
    return availability;
  }

  /**
   * Find availability by user ID
   */
  async findByUserId(userId: string): Promise<ProfessionalAvailabilityEntity[]> {
    return this.availabilityRepository.find({
      where: { userId, isActive: 1 },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  /**
   * Check if user is a professional user
   */
  async isProfessionalUser(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM profession_user WHERE user_id = ?',
      [userId],
    );
    return (result[0]?.count || 0) > 0;
  }

  /**
   * Get professional user details
   */
  async getProfessionalUserDetails(userId: string): Promise<any[]> {
    return this.dataSource.query(
      'SELECT profession_id, is_primary, experience_years, is_verified FROM profession_user WHERE user_id = ?',
      [userId],
    );
  }

  /**
   * Get availability ordered by day of week
   */
  async getAvailabilityOrderedByDay(userId: string): Promise<ProfessionalAvailabilityEntity[]> {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const availability = await this.availabilityRepository.find({
      where: { userId, isActive: 1 },
    });

    // Sort by day of week order
    return availability.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.dayOfWeek.toLowerCase());
      const bIndex = dayOrder.indexOf(b.dayOfWeek.toLowerCase());
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Paginate availability
   */
  async paginate(query: PaginationQueryDto): Promise<PaginatedResult<ProfessionalAvailabilityEntity>> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.availabilityRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
