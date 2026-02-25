import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserBlockEntity } from '../entities/user-block.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BlockUserDto } from '../dto/block-user.dto';
import { UnblockUserDto } from '../dto/unblock-user.dto';
import { GetBlockedUsersDto } from '../dto/get-blocked-users.dto';
import { CheckIfBlockedDto } from '../dto/check-if-blocked.dto';
import { ConfigService } from '@nestjs/config';

/**
 * Public/user-facing service — handles all user blocks endpoints matching Yii API
 */
@Injectable()
export class UserBlocksPublicService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(UserBlockEntity)
    private readonly userBlocksRepository: Repository<UserBlockEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    // Get base host from config or use default
    this.baseHost = this.configService.get<string>('app.baseHost') || 
                    process.env.BASE_HOST || 
                    'http://localhost:3000/';
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
   * Block user (actionBlockUser)
   * Matches Yii implementation exactly
   */
  async blockUser(blockerId: string, dto: BlockUserDto): Promise<any> {
    try {
      // Check if trying to block themselves
      if (blockerId === dto.blockedUserId) {
        throw new BadRequestException('You cannot block yourself');
      }

      // Check if blocked user exists
      const blockedUser = await this.usersRepository.findOne({
        where: { id: dto.blockedUserId },
      });
      if (!blockedUser) {
        throw new NotFoundException('User not found');
      }

      // Check if already blocked
      const existingBlock = await this.userBlocksRepository.findOne({
        where: {
          blockerId,
          blockedId: dto.blockedUserId,
        },
      });

      if (existingBlock) {
        throw new ConflictException('User is already blocked');
      }

      // Create block
      const block = this.userBlocksRepository.create({
        blockerId,
        blockedId: dto.blockedUserId,
        reason: dto.reason || null,
        createdAt: new Date(),
      } as Partial<UserBlockEntity>);

      await this.userBlocksRepository.save(block);

      return {
        succeeded: true,
        message: 'User blocked successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to block user');
    }
  }

  /**
   * Unblock user (actionUnblockUser)
   * Matches Yii implementation exactly
   */
  async unblockUser(blockerId: string, dto: UnblockUserDto): Promise<any> {
    try {
      // Find and delete the block
      const block = await this.userBlocksRepository.findOne({
        where: {
          blockerId,
          blockedId: dto.blockedUserId,
        },
      });

      if (!block) {
        throw new NotFoundException('Block not found');
      }

      await this.userBlocksRepository.remove(block);

      return {
        succeeded: true,
        message: 'User unblocked successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unblock user');
    }
  }

  /**
   * Get blocked users (actionGetBlockedUsers)
   * Matches Yii implementation exactly
   */
  async getBlockedUsers(userId: string, dto: GetBlockedUsersDto): Promise<any> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const offset = (page - 1) * limit;

      // Count total records
      const totalCount = await this.userBlocksRepository.count({
        where: { blockerId: userId },
      });

      // Query matches Yii: UserBlocks::find()->select([...])->leftJoin('users u', ...)
      const blockedUsers = await this.dataSource
        .createQueryBuilder()
        .select([
          'user_blocks.id AS block_id',
          'user_blocks.blocked_id AS blocked_id',
          'user_blocks.reason AS reason',
          'user_blocks.created_at AS blocked_at',
          'u.id AS user_id',
          'u.first_name AS first_name',
          'u.last_name AS last_name',
          'u.email AS email',
          'u.phone_number AS phone_number',
          'u.user_work AS user_work',
          'u.bio AS bio',
          'u.average_rating AS average_rating',
          'u.total_ratings AS total_ratings',
          `CASE 
            WHEN u.main_image LIKE 'http%' THEN u.main_image
            ELSE CONCAT('${this.baseHost.replace(/'/g, "''")}', u.main_image)
          END AS main_image`,
        ])
        .from('user_blocks', 'user_blocks')
        .leftJoin('users', 'u', 'u.id = user_blocks.blocked_id')
        .where('user_blocks.blocker_id = :userId', { userId })
        .orderBy('user_blocks.created_at', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();

      return {
        succeeded: true,
        blocked_users: blockedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount),
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get blocked users');
    }
  }

  /**
   * Check if blocked (actionCheckIfBlocked)
   * Matches Yii implementation exactly
   */
  async checkIfBlocked(userId: string, dto: CheckIfBlockedDto): Promise<any> {
    try {
      // Check if user blocked target
      const block1 = await this.userBlocksRepository.findOne({
        where: {
          blockerId: userId,
          blockedId: dto.targetUserId,
        },
      });
      const isBlocked = !!block1;

      // Check if target blocked user
      const block2 = await this.userBlocksRepository.findOne({
        where: {
          blockerId: dto.targetUserId,
          blockedId: userId,
        },
      });
      const isBlockedBy = !!block2;

      return {
        succeeded: true,
        you_blocked_them: isBlocked,
        they_blocked_you: isBlockedBy,
        is_mutually_blocked: isBlocked && isBlockedBy,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to check block status');
    }
  }
}
