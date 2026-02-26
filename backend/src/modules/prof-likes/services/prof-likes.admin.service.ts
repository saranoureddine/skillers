import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfLikeEntity } from '../entities/prof-like.entity';
import { ProfLikesService } from './prof-likes.service';

/**
 * Admin-only service — handles admin endpoints for prof likes management
 */
@Injectable()
export class ProfLikesAdminService {
  constructor(
    @InjectRepository(ProfLikeEntity)
    private readonly likesRepository: Repository<ProfLikeEntity>,
    private readonly likesService: ProfLikesService,
  ) {}

  /**
   * Get all likes (admin)
   */
  async getAllLikes(): Promise<ProfLikeEntity[]> {
    return this.likesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.likesRepository.count();
    
    const postLikes = await this.likesRepository.count({
      where: { likeableType: 'post' },
    });

    const commentLikes = await this.likesRepository.count({
      where: { likeableType: 'comment' },
    });

    return {
      total,
      post_likes: postLikes,
      comment_likes: commentLikes,
    };
  }
}
