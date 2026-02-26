import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfFollowEntity } from '../entities/prof-follow.entity';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Shared prof follow service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfFollowService {
  constructor(
    @InjectRepository(ProfFollowEntity)
    private readonly followRepository: Repository<ProfFollowEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Find follow relationship
   */
  async findFollow(followerId: string, followingId: string): Promise<ProfFollowEntity | null> {
    return this.followRepository.findOne({
      where: { followerId, followingId },
    });
  }

  /**
   * Find follow by status
   */
  async findFollowByStatus(
    followerId: string,
    followingId: string,
    status: string,
  ): Promise<ProfFollowEntity | null> {
    return this.followRepository.findOne({
      where: { followerId, followingId, status },
    });
  }

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.findFollowByStatus(followerId, followingId, 'following');
    return !!follow;
  }

  /**
   * Check if user A is blocked by user B
   */
  async isBlocked(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.findFollowByStatus(followerId, followingId, 'blocked');
    return !!follow;
  }

  /**
   * Check if user A is muted by user B
   */
  async isMuted(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.findFollowByStatus(followerId, followingId, 'muted');
    return !!follow;
  }

  /**
   * Update follow counts for users
   */
  async updateFollowCounts(followerId: string, followingId: string, action: 'follow' | 'unfollow'): Promise<void> {
    try {
      if (action === 'follow') {
        // Increment counts
        await this.usersRepository.increment({ id: followingId }, 'followersCount', 1);
        await this.usersRepository.increment({ id: followerId }, 'followingCount', 1);
      } else if (action === 'unfollow') {
        // Decrement counts (with floor at 0)
        await this.usersRepository
          .createQueryBuilder()
          .update(UserEntity)
          .set({ followersCount: () => 'GREATEST(followers_count - 1, 0)' })
          .where('id = :id', { id: followingId })
          .execute();

        await this.usersRepository
          .createQueryBuilder()
          .update(UserEntity)
          .set({ followingCount: () => 'GREATEST(following_count - 1, 0)' })
          .where('id = :id', { id: followerId })
          .execute();
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to update follow counts:', error);
    }
  }
}
