import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatBlockedUserEntity } from '../entities/chat-blocked-user.entity';

/**
 * Shared chat blocked users service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ChatBlockedUsersService {
  constructor(
    @InjectRepository(ChatBlockedUserEntity)
    private readonly blockedUsersRepository: Repository<ChatBlockedUserEntity>,
  ) {}

  /**
   * Find blocked user by ID
   */
  async findById(id: number): Promise<ChatBlockedUserEntity> {
    const blockedUser = await this.blockedUsersRepository.findOne({ where: { id } });
    if (!blockedUser) {
      throw new NotFoundException(`Blocked user with ID ${id} not found`);
    }
    return blockedUser;
  }

  /**
   * Find all blocked users
   */
  async findAll(): Promise<ChatBlockedUserEntity[]> {
    return this.blockedUsersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocked = await this.blockedUsersRepository.findOne({
      where: { blockerId, blockedId },
    });
    return !!blocked;
  }

  /**
   * Find block record
   */
  async findBlock(blockerId: string, blockedId: string): Promise<ChatBlockedUserEntity | null> {
    return this.blockedUsersRepository.findOne({
      where: { blockerId, blockedId },
    });
  }
}
