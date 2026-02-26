import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';
import { ProfessionsService } from './professions.service';

/**
 * Admin-only service — handles admin endpoints for professions management
 */
@Injectable()
export class ProfessionsAdminService {
  constructor(
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    private readonly professionsService: ProfessionsService,
  ) {}

  /**
   * Get all professions (admin)
   */
  async getAllProfessions(): Promise<ProfCategoryEntity[]> {
    return this.profCategoriesRepository.find({
      where: { parentId: Not(IsNull()) },
      order: { parentId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.profCategoriesRepository.count({
      where: { parentId: Not(IsNull()) },
    });

    const active = await this.profCategoriesRepository.count({
      where: { parentId: Not(IsNull()), isActive: 1 },
    });

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
