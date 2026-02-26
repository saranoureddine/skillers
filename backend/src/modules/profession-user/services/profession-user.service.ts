import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionUserEntity } from '../entities/profession-user.entity';

/**
 * Shared profession user service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfessionUserService {
  constructor(
    @InjectRepository(ProfessionUserEntity)
    private readonly professionUserRepository: Repository<ProfessionUserEntity>,
  ) {}

  /**
   * Find profession user by ID
   */
  async findById(id: number): Promise<ProfessionUserEntity> {
    const professionUser = await this.professionUserRepository.findOne({ where: { id } });
    if (!professionUser) {
      throw new NotFoundException(`Profession user with ID ${id} not found`);
    }
    return professionUser;
  }

  /**
   * Find profession user by user ID and profession ID
   */
  async findByUserAndProfession(userId: string, professionId: number): Promise<ProfessionUserEntity | null> {
    return this.professionUserRepository.findOne({
      where: { userId, professionId },
    });
  }

  /**
   * Get user's profession count
   */
  async getUserProfessionCount(userId: string): Promise<number> {
    return this.professionUserRepository.count({
      where: { userId },
    });
  }

  /**
   * Get all professions for a user
   */
  async getUserProfessions(userId: string): Promise<ProfessionUserEntity[]> {
    return this.professionUserRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }
}
