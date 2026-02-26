import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfFollowEntity } from '../entities/prof-follow.entity';
import { ProfFollowService } from './prof-follow.service';

/**
 * Admin-only service — handles admin endpoints for prof follow management
 */
@Injectable()
export class ProfFollowAdminService {
  constructor(
    @InjectRepository(ProfFollowEntity)
    private readonly followRepository: Repository<ProfFollowEntity>,
    private readonly followService: ProfFollowService,
  ) {}

  /**
   * Get all follow relationships (admin)
   */
  async getAllFollows(): Promise<ProfFollowEntity[]> {
    return this.followRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.followRepository.count();
    const following = await this.followRepository.count({ where: { status: 'following' } });
    const blocked = await this.followRepository.count({ where: { status: 'blocked' } });
    const muted = await this.followRepository.count({ where: { status: 'muted' } });

    return {
      total,
      following,
      blocked,
      muted,
    };
  }
}
