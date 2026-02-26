import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfGroupEntity } from '../entities/prof-group.entity';
import { ProfGroupMemberEntity } from '../entities/prof-group-member.entity';

/**
 * Shared prof groups service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ProfGroupsService {
  constructor(
    @InjectRepository(ProfGroupEntity)
    private readonly groupsRepository: Repository<ProfGroupEntity>,
    @InjectRepository(ProfGroupMemberEntity)
    private readonly membersRepository: Repository<ProfGroupMemberEntity>,
  ) {}

  /**
   * Find group by ID
   */
  async findById(id: number): Promise<ProfGroupEntity> {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  /**
   * Find active group by ID
   */
  async findActiveById(id: number): Promise<ProfGroupEntity> {
    const group = await this.groupsRepository.findOne({ where: { id, isActive: 1 } });
    if (!group) {
      throw new NotFoundException(`Active group with ID ${id} not found`);
    }
    return group;
  }

  /**
   * Find member by group and user
   */
  async findMember(groupId: number, userId: string): Promise<ProfGroupMemberEntity | null> {
    return this.membersRepository.findOne({
      where: { groupId, userId },
    });
  }

  /**
   * Find active member by group and user
   */
  async findActiveMember(groupId: number, userId: string): Promise<ProfGroupMemberEntity | null> {
    return this.membersRepository.findOne({
      where: { groupId, userId, isActive: 1 },
    });
  }

  /**
   * Check if user is member
   */
  async isMember(groupId: number, userId: string): Promise<boolean> {
    const member = await this.findActiveMember(groupId, userId);
    return !!member;
  }

  /**
   * Check if user is admin or owner
   */
  async isAdminOrOwner(groupId: number, userId: string): Promise<boolean> {
    const member = await this.findActiveMember(groupId, userId);
    if (!member) return false;
    
    const group = await this.findById(groupId);
    return member.role === 'admin' || group.ownerId === userId;
  }

  /**
   * Increment posts count
   */
  async incrementPostsCount(groupId: number): Promise<boolean> {
    try {
      await this.groupsRepository.increment({ id: groupId }, 'postsCount', 1);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Decrement posts count
   */
  async decrementPostsCount(groupId: number): Promise<boolean> {
    try {
      await this.groupsRepository
        .createQueryBuilder()
        .update(ProfGroupEntity)
        .set({ postsCount: () => 'GREATEST(posts_count - 1, 0)' })
        .where('id = :id', { id: groupId })
        .execute();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sync members count
   */
  async syncMembersCount(groupId: number): Promise<number> {
    try {
      const count = await this.membersRepository.count({
        where: { groupId, isActive: 1 },
      });
      
      await this.groupsRepository.update({ id: groupId }, { membersCount: count });
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Sync posts count
   */
  async syncPostsCount(groupId: number, dataSource: any): Promise<number> {
    try {
      const result = await dataSource.query(
        'SELECT COUNT(*) as count FROM prof_posts WHERE group_id = ? AND is_deleted = 0',
        [groupId]
      );
      
      const count = result[0]?.count || 0;
      await this.groupsRepository.update({ id: groupId }, { postsCount: count });
      return count;
    } catch (error) {
      return 0;
    }
  }
}
