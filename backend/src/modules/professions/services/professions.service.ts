import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { ProfCategoryEntity } from '../../prof-categories/entities/prof-category.entity';

/**
 * Shared professions service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(ProfCategoryEntity)
    private readonly profCategoriesRepository: Repository<ProfCategoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find profession by ID (must have parent_id)
   */
  async findById(id: number): Promise<ProfCategoryEntity> {
    const profession = await this.profCategoriesRepository.findOne({
      where: { id, parentId: Not(IsNull()) },
    });
    if (!profession) {
      throw new NotFoundException(`Profession with ID ${id} not found`);
    }
    return profession;
  }

  /**
   * Get all category IDs in hierarchy (recursive)
   */
  async getAllCategoryIdsInHierarchy(categoryId: number): Promise<number[]> {
    const categoryIds: number[] = [categoryId];

    // Get direct subcategories
    const subcategories = await this.dataSource.query(
      'SELECT id FROM prof_categories WHERE is_active = 1 AND parent_id = ?',
      [categoryId]
    );

    for (const subcategory of subcategories) {
      // Recursively get subcategories of subcategories
      const subcategoryIds = await this.getAllCategoryIdsInHierarchy(subcategory.id);
      categoryIds.push(...subcategoryIds);
    }

    return categoryIds;
  }
}
