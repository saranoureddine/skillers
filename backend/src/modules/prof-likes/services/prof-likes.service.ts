import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfLikeEntity } from '../entities/prof-like.entity';

/**
 * Shared prof likes service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfLikesService {
  constructor(
    @InjectRepository(ProfLikeEntity)
    private readonly likesRepository: Repository<ProfLikeEntity>,
  ) {}

  /**
   * Find like by ID
   */
  async findById(id: number): Promise<ProfLikeEntity> {
    const like = await this.likesRepository.findOne({ where: { id } });
    if (!like) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
    return like;
  }

  /**
   * Find like by user and likeable
   */
  async findByUserAndLikeable(
    userId: string,
    likeableType: string,
    likeableId: number,
  ): Promise<ProfLikeEntity | null> {
    return this.likesRepository.findOne({
      where: { userId, likeableType, likeableId },
    });
  }

  /**
   * Check if user has liked
   */
  async isLiked(userId: string, likeableType: string, likeableId: number): Promise<boolean> {
    const like = await this.findByUserAndLikeable(userId, likeableType, likeableId);
    return !!like;
  }

  /**
   * Get likes count
   */
  async getLikesCount(likeableType: string, likeableId: number): Promise<number> {
    return this.likesRepository.count({
      where: { likeableType, likeableId },
    });
  }
}
