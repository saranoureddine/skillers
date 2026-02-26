import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProfGroupEntity } from '../entities/prof-group.entity';
import { ProfGroupMemberEntity } from '../entities/prof-group-member.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GetGroupsDto } from '../dto/get-groups.dto';
import { GetGroupDto } from '../dto/get-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { DeleteGroupDto } from '../dto/delete-group.dto';
import { JoinGroupDto } from '../dto/join-group.dto';
import { LeaveGroupDto } from '../dto/leave-group.dto';
import { GetGroupMembersDto } from '../dto/get-group-members.dto';
import { GetUserGroupsDto } from '../dto/get-user-groups.dto';
import { SyncCountsDto } from '../dto/sync-counts.dto';
import { ProfGroupsService } from './prof-groups.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ProfGroupsPublicService {
  private readonly baseHost: string;
  private readonly ROLE_ADMIN = 'admin';
  private readonly ROLE_MODERATOR = 'moderator';
  private readonly ROLE_MEMBER = 'member';
  private readonly ROLE_OWNER = 'owner';

  constructor(
    @InjectRepository(ProfGroupEntity)
    private readonly groupsRepository: Repository<ProfGroupEntity>,
    @InjectRepository(ProfGroupMemberEntity)
    private readonly membersRepository: Repository<ProfGroupMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly groupsService: ProfGroupsService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
  }

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Build image URL
   */
  private buildImageUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${this.baseHost}/${filePath.replace(/^\/+/, '')}`;
  }

  /**
   * Create a new professional group
   */
  async createGroup(
    dto: CreateGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = this.groupsRepository.create({
        name: dto.name,
        description: dto.description || null,
        ownerId: userId,
        categoryId: dto.categoryId || null,
        isPublic: dto.isPublic !== undefined ? dto.isPublic : 1,
        isActive: 1,
        membersCount: 1, // Owner is automatically a member
        postsCount: 0,
        coverImage: dto.coverImage || null,
      });

      const savedGroup = await queryRunner.manager.save(group);

      // Add owner as admin member
      const member = this.membersRepository.create({
        groupId: savedGroup.id,
        userId: userId,
        role: this.ROLE_ADMIN,
        isActive: 1,
      });

      await queryRunner.manager.save(member);
      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Group created successfully',
        group_id: savedGroup.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create group');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get groups with filtering and pagination
   */
  async getGroups(
    dto: GetGroupsDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { categoryId, isPublic, search, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      let countQuery = `
        SELECT COUNT(DISTINCT pg.id) as count
        FROM prof_groups pg
        LEFT JOIN prof_categories pc ON pc.id = pg.category_id
        LEFT JOIN users u ON u.id = pg.owner_id
        LEFT JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
        WHERE pg.is_active = 1
      `;

      const countParams: any[] = [userId];

      if (categoryId) {
        countQuery += ' AND pg.category_id = ?';
        countParams.push(categoryId);
      }

      if (isPublic !== undefined && isPublic !== null) {
        countQuery += ' AND pg.is_public = ?';
        countParams.push(isPublic);
      }

      if (search) {
        countQuery += ` AND (pg.name LIKE ? OR pg.description LIKE ?)`;
        const searchParam = `%${search}%`;
        countParams.push(searchParam, searchParam);
      }

      const totalResult = await this.dataSource.query(countQuery, countParams);
      const totalCount = totalResult[0]?.count || 0;

      // Data query
      let dataQuery = `
        SELECT 
          pg.id,
          pg.name,
          pg.description,
          pg.owner_id,
          pg.category_id,
          pg.is_public,
          pg.members_count,
          pg.posts_count,
          pg.cover_image,
          pg.created_at,
          pg.updated_at,
          pc.name as category_name,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          CASE 
            WHEN pg.cover_image LIKE 'http%' THEN pg.cover_image
            ELSE CONCAT(?, pg.cover_image)
          END AS cover_image_url,
          IF(pgm.id IS NOT NULL, 1, 0) as is_member,
          pgm.role as member_role
        FROM prof_groups pg
        LEFT JOIN prof_categories pc ON pc.id = pg.category_id
        LEFT JOIN users u ON u.id = pg.owner_id
        LEFT JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
        WHERE pg.is_active = 1
      `;

      const dataParams: any[] = [this.baseHost, userId];

      if (categoryId) {
        dataQuery += ' AND pg.category_id = ?';
        dataParams.push(categoryId);
      }

      if (isPublic !== undefined && isPublic !== null) {
        dataQuery += ' AND pg.is_public = ?';
        dataParams.push(isPublic);
      }

      if (search) {
        dataQuery += ` AND (pg.name LIKE ? OR pg.description LIKE ?)`;
        const searchParam = `%${search}%`;
        dataParams.push(searchParam, searchParam);
      }

      dataQuery += ' ORDER BY pg.created_at DESC LIMIT ? OFFSET ?';
      dataParams.push(limit, offset);

      const groups = await this.dataSource.query(dataQuery, dataParams);

      return {
        succeeded: true,
        groups,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get groups');
    }
  }

  /**
   * Get a specific group with details
   */
  async getGroup(
    dto: GetGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const group = await this.dataSource.query(
        `SELECT 
          pg.id,
          pg.name,
          pg.description,
          pg.owner_id,
          pg.category_id,
          pg.is_public,
          pg.members_count,
          pg.posts_count,
          pg.cover_image,
          pg.created_at,
          pg.updated_at,
          pc.name as category_name,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          CASE 
            WHEN pg.cover_image LIKE 'http%' THEN pg.cover_image
            ELSE CONCAT(?, pg.cover_image)
          END AS cover_image_url,
          IF(pgm.id IS NOT NULL, 1, 0) as is_member,
          pgm.role as member_role
        FROM prof_groups pg
        LEFT JOIN prof_categories pc ON pc.id = pg.category_id
        LEFT JOIN users u ON u.id = pg.owner_id
        LEFT JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
        WHERE pg.id = ? AND pg.is_active = 1`,
        [this.baseHost, userId, dto.groupId]
      );

      if (!group[0]) {
        throw new NotFoundException('Group not found');
      }

      // Check if group is public or user is a member
      if (group[0].is_public === 0 && group[0].is_member === 0) {
        throw new ForbiddenException('Access denied');
      }

      return {
        succeeded: true,
        group: group[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get group');
    }
  }

  /**
   * Update a group
   */
  async updateGroup(
    dto: UpdateGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const group = await this.groupsService.findById(dto.groupId);

      // Check if user is owner or admin
      const member = await this.groupsService.findActiveMember(dto.groupId, userId);
      if (!member || (member.role !== this.ROLE_ADMIN && group.ownerId !== userId)) {
        throw new ForbiddenException('Access denied');
      }

      // Update fields
      if (dto.name !== undefined) group.name = dto.name;
      if (dto.description !== undefined) group.description = dto.description;
      if (dto.categoryId !== undefined) group.categoryId = dto.categoryId;
      if (dto.isPublic !== undefined) group.isPublic = dto.isPublic;
      if (dto.coverImage !== undefined) group.coverImage = dto.coverImage;

      await this.groupsRepository.save(group);

      return {
        succeeded: true,
        message: 'Group updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update group');
    }
  }

  /**
   * Delete a group (soft delete)
   */
  async deleteGroup(
    dto: DeleteGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const group = await this.groupsService.findById(dto.groupId);

      // Check if user is owner
      if (group.ownerId !== userId) {
        throw new ForbiddenException('Only group owner can delete the group');
      }

      // Soft delete
      group.isActive = 0;
      await this.groupsRepository.save(group);

      return {
        succeeded: true,
        message: 'Group deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete group');
    }
  }

  /**
   * Join a group
   */
  async joinGroup(
    dto: JoinGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = await this.groupsService.findActiveById(dto.groupId);

      // Check if already a member
      const existingMember = await this.groupsService.findMember(dto.groupId, userId);
      
      if (existingMember) {
        if (existingMember.isActive === 1) {
          throw new ConflictException('Already a member of this group');
        } else {
          // Reactivate membership
          existingMember.isActive = 1;
          existingMember.leftAt = null;
          existingMember.role = this.ROLE_MEMBER;
          await queryRunner.manager.save(existingMember);
          
          // Increment members count
          group.membersCount = group.membersCount + 1;
          await queryRunner.manager.save(group);
        }
      } else {
        // Create new membership
        const member = this.membersRepository.create({
          groupId: dto.groupId,
          userId: userId,
          role: this.ROLE_MEMBER,
          isActive: 1,
        });

        await queryRunner.manager.save(member);
        
        // Increment members count
        group.membersCount = group.membersCount + 1;
        await queryRunner.manager.save(group);
      }

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Joined group successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to join group');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(
    dto: LeaveGroupDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const member = await this.groupsService.findActiveMember(dto.groupId, userId);
      if (!member) {
        throw new NotFoundException('Not a member of this group');
      }

      // Check if trying to leave as owner
      const group = await this.groupsService.findById(dto.groupId);
      if (group.ownerId === userId) {
        throw new BadRequestException('Group owner cannot leave the group');
      }

      // Deactivate membership
      member.isActive = 0;
      member.leftAt = new Date();
      await queryRunner.manager.save(member);

      // Decrement members count
      group.membersCount = Math.max(0, group.membersCount - 1);
      await queryRunner.manager.save(group);

      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Left group successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to leave group');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(
    dto: GetGroupMembersDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { groupId, page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Check if group exists and user has access
      const group = await this.groupsService.findActiveById(groupId);

      // Check if user is a member or group is public
      const isMember = await this.groupsService.isMember(groupId, userId);
      if (group.isPublic === 0 && !isMember) {
        throw new ForbiddenException('Access denied');
      }

      // Count query
      const totalResult = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM prof_group_members pgm LEFT JOIN users u ON u.id = pgm.user_id WHERE pgm.group_id = ? AND pgm.is_active = 1',
        [groupId]
      );
      const totalCount = totalResult[0]?.count || 0;

      // Data query
      const members = await this.dataSource.query(
        `SELECT 
          pgm.id,
          pgm.user_id,
          pgm.role,
          pgm.joined_at,
          u.first_name,
          u.last_name,
          u.email,
          u.bio,
          CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT(?, u.main_image)
          END AS main_image
        FROM prof_group_members pgm
        LEFT JOIN users u ON u.id = pgm.user_id
        WHERE pgm.group_id = ? AND pgm.is_active = 1
        ORDER BY 
          CASE pgm.role
            WHEN 'admin' THEN 1
            WHEN 'moderator' THEN 2
            WHEN 'member' THEN 3
            ELSE 4
          END,
          pgm.joined_at ASC
        LIMIT ? OFFSET ?`,
        [this.baseHost, groupId, limit, offset]
      );

      return {
        succeeded: true,
        members,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get group members');
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(
    dto: GetUserGroupsDto,
    currentUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const targetUserId = dto.userId || currentUserId;
      const { page = 1, limit = 20 } = dto;
      const offset = (page - 1) * limit;

      // Count query
      const totalResult = await this.dataSource.query(
        `SELECT COUNT(DISTINCT pg.id) as count
        FROM prof_groups pg
        LEFT JOIN prof_categories pc ON pc.id = pg.category_id
        LEFT JOIN users u ON u.id = pg.owner_id
        INNER JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
        WHERE pg.is_active = 1`,
        [targetUserId]
      );
      const totalCount = totalResult[0]?.count || 0;

      // Data query
      const groups = await this.dataSource.query(
        `SELECT 
          pg.id,
          pg.name,
          pg.description,
          pg.owner_id,
          pg.category_id,
          pg.is_public,
          pg.members_count,
          pg.posts_count,
          pg.cover_image,
          pg.created_at,
          pg.updated_at,
          pc.name as category_name,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          CASE 
            WHEN pg.cover_image LIKE 'http%' THEN pg.cover_image
            ELSE CONCAT(?, pg.cover_image)
          END AS cover_image_url,
          pgm.role as member_role,
          pgm.joined_at
        FROM prof_groups pg
        LEFT JOIN prof_categories pc ON pc.id = pg.category_id
        LEFT JOIN users u ON u.id = pg.owner_id
        INNER JOIN prof_group_members pgm ON pgm.group_id = pg.id AND pgm.user_id = ? AND pgm.is_active = 1
        WHERE pg.is_active = 1
        ORDER BY pgm.joined_at DESC
        LIMIT ? OFFSET ?`,
        [this.baseHost, targetUserId, limit, offset]
      );

      return {
        succeeded: true,
        groups,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user groups');
    }
  }

  /**
   * Sync group counts (members and posts)
   */
  async syncCounts(
    dto: SyncCountsDto,
    userId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      // Check if user is admin or owner of the group
      const member = await this.groupsService.findActiveMember(dto.groupId, userId);
      const group = await this.groupsService.findById(dto.groupId);
      
      if (!member || (member.role !== this.ROLE_ADMIN && group.ownerId !== userId)) {
        throw new ForbiddenException('Access denied');
      }

      // Sync both counts
      const membersCount = await this.groupsService.syncMembersCount(dto.groupId);
      const postsCount = await this.groupsService.syncPostsCount(dto.groupId, this.dataSource);

      return {
        succeeded: true,
        message: 'Counts synced successfully',
        members_count: membersCount,
        posts_count: postsCount,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to sync counts');
    }
  }
}
