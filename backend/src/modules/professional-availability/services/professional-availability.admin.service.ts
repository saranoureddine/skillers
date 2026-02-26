import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionalAvailabilityEntity } from '../entities/professional-availability.entity';
import { ProfessionalAvailabilityService } from './professional-availability.service';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

/**
 * Admin-only service — handles admin endpoints for professional availability management
 */
@Injectable()
export class ProfessionalAvailabilityAdminService {
  constructor(
    @InjectRepository(ProfessionalAvailabilityEntity)
    private readonly availabilityRepository: Repository<ProfessionalAvailabilityEntity>,
    private readonly availabilityService: ProfessionalAvailabilityService,
  ) {}

  /**
   * Get all availability (admin)
   */
  async getAllAvailability(query: PaginationQueryDto): Promise<PaginatedResult<ProfessionalAvailabilityEntity>> {
    return this.availabilityService.paginate(query);
  }

  /**
   * Get availability by user ID (admin)
   */
  async getAvailabilityByUserId(userId: string): Promise<ProfessionalAvailabilityEntity[]> {
    return this.availabilityService.findByUserId(userId);
  }

  /**
   * Delete availability by ID (admin - can delete any availability)
   */
  async deleteAvailability(availabilityId: number): Promise<void> {
    const result = await this.availabilityRepository.delete(availabilityId);
    if (result.affected === 0) {
      throw new NotFoundException(`Availability with ID ${availabilityId} not found`);
    }
  }

  /**
   * Get availability statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.availabilityRepository.count();
    const active = await this.availabilityRepository.count({ where: { isActive: 1 } });
    const inactive = await this.availabilityRepository.count({ where: { isActive: 0 } });

    return {
      total,
      active,
      inactive,
    };
  }
}
