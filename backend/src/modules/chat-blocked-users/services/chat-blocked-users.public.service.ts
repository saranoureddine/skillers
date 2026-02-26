import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatBlockedUserEntity } from '../entities/chat-blocked-user.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateChatBlockedUserDto } from '../dto/create-chat-blocked-user.dto';
import { UpdateChatBlockedUserDto } from '../dto/update-chat-blocked-user.dto';
import { ToggleBlockDto } from '../dto/toggle-block.dto';
import { ChatBlockedUsersService } from './chat-blocked-users.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ChatBlockedUsersPublicService {
  constructor(
    @InjectRepository(ChatBlockedUserEntity)
    private readonly blockedUsersRepository: Repository<ChatBlockedUserEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly blockedUsersService: ChatBlockedUsersService,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Get all blocked users
   */
  async getAllBlocked(): Promise<any> {
    try {
      const blocked = await this.blockedUsersService.findAll();
      return {
        succeeded: true,
        blocked_users: blocked,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve blocked users');
    }
  }

  /**
   * Get blocked user by ID
   */
  async getBlockedById(id: number): Promise<any> {
    try {
      const blocked = await this.blockedUsersService.findById(id);
      return {
        succeeded: true,
        blocked_user: blocked,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve blocked user');
    }
  }

  /**
   * Create blocked user
   */
  async createBlocked(dto: CreateChatBlockedUserDto): Promise<any> {
    try {
      const { blockerId, blockedId } = dto;

      // Validate required fields
      if (!blockerId || !blockedId) {
        throw new BadRequestException('Missing required fields: blocker_id and blocked_id');
      }

      // Check if block already exists
      const existing = await this.blockedUsersService.findBlock(blockerId, blockedId);
      if (existing) {
        throw new ConflictException('User is already blocked');
      }

      // Create block record
      const blockedUser = this.blockedUsersRepository.create({
        blockerId,
        blockedId,
      });

      const saved = await this.blockedUsersRepository.save(blockedUser);

      return {
        succeeded: true,
        message: 'Blocked user created successfully',
        blocked_user: saved,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create blocked user');
    }
  }

  /**
   * Update blocked user
   */
  async updateBlocked(id: number, dto: UpdateChatBlockedUserDto): Promise<any> {
    try {
      const blockedUser = await this.blockedUsersService.findById(id);

      if (dto.blockerId !== undefined) {
        blockedUser.blockerId = dto.blockerId;
      }
      if (dto.blockedId !== undefined) {
        blockedUser.blockedId = dto.blockedId;
      }

      const updated = await this.blockedUsersRepository.save(blockedUser);

      return {
        succeeded: true,
        message: 'Blocked user updated successfully',
        blocked_user: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update blocked user');
    }
  }

  /**
   * Delete blocked user
   */
  async deleteBlocked(id: number): Promise<any> {
    try {
      const blockedUser = await this.blockedUsersService.findById(id);
      await this.blockedUsersRepository.remove(blockedUser);

      return {
        succeeded: true,
        message: 'Blocked user deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete blocked user');
    }
  }

  /**
   * Toggle block/unblock a user
   */
  async toggleBlock(blockerId: string, dto: ToggleBlockDto): Promise<any> {
    try {
      const { blockedId } = dto;

      // Validate blocked user exists
      const blockedUser = await this.usersRepository.findOne({ where: { id: blockedId } });
      if (!blockedUser) {
        throw new NotFoundException('User not found');
      }

      // Check if user is trying to block themselves
      if (blockerId === blockedId) {
        throw new BadRequestException('Cannot block yourself');
      }

      // Check if block already exists
      const existingBlock = await this.blockedUsersService.findBlock(blockerId, blockedId);

      const timestamp = new Date().toISOString();
      let isBlocking = false;
      let eventType = '';
      let actionMessage = '';

      if (existingBlock) {
        // Unblock user
        await this.blockedUsersRepository.remove(existingBlock);
        isBlocking = false;
        eventType = 'user_unblocked';
        actionMessage = 'User unblocked successfully';
      } else {
        // Block user
        const block = this.blockedUsersRepository.create({
          blockerId,
          blockedId,
        });
        await this.blockedUsersRepository.save(block);
        isBlocking = true;
        eventType = 'user_blocked';
        actionMessage = 'User blocked successfully';
      }

      // TODO: Broadcast via Centrifugo (would need Centrifugo service)
      // For now, just return success with broadcast status structure
      const channel = `skillers_${blockedId}`;
      const broadcastData = {
        type: eventType,
        blocker_id: blockerId,
        blocked_id: blockedId,
        timestamp,
      };

      return {
        succeeded: true,
        message: actionMessage,
        is_blocked: isBlocking,
        blocker_id: blockerId,
        blocked_id: blockedId,
        event_type: eventType,
        timestamp,
        broadcast_status: {
          attempted: true,
          success: false, // TODO: Implement Centrifugo broadcasting
          channel,
          error: null,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to toggle block');
    }
  }
}
