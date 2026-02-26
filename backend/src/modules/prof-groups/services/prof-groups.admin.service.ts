import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfGroupEntity } from '../entities/prof-group.entity';
import { ProfGroupMemberEntity } from '../entities/prof-group-member.entity';
import { ProfGroupsService } from './prof-groups.service';

/**
 * Admin-only service — handles admin endpoints for prof groups management
 */
@Injectable()
export class ProfGroupsAdminService {
  constructor(
    @InjectRepository(ProfGroupEntity)
    private readonly groupsRepository: Repository<ProfGroupEntity>,
    @InjectRepository(ProfGroupMemberEntity)
    private readonly membersRepository: Repository<ProfGroupMemberEntity>,
    private readonly groupsService: ProfGroupsService,
  ) {}

  /**
   * Get all groups (admin)
   */
  async getAllGroups(): Promise<ProfGroupEntity[]> {
    return this.groupsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.groupsRepository.count();
    const active = await this.groupsRepository.count({ where: { isActive: 1 } });
    const publicGroups = await this.groupsRepository.count({ where: { isPublic: 1, isActive: 1 } });
    const privateGroups = await this.groupsRepository.count({ where: { isPublic: 0, isActive: 1 } });
    
    const totalMembers = await this.membersRepository.count({ where: { isActive: 1 } });
    const totalPosts = await this.groupsRepository
      .createQueryBuilder('pg')
      .select('SUM(pg.posts_count)', 'total')
      .getRawOne();

    return {
      total,
      active,
      inactive: total - active,
      public: publicGroups,
      private: privateGroups,
      total_members: totalMembers,
      total_posts: parseInt(totalPosts?.total || '0', 10),
    };
  }
}
