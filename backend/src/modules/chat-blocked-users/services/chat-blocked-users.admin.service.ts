import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatBlockedUserEntity } from '../entities/chat-blocked-user.entity';
import { ChatBlockedUsersService } from './chat-blocked-users.service';

/**
 * Admin-only service — handles admin endpoints for chat blocked users management
 */
@Injectable()
export class ChatBlockedUsersAdminService {
  constructor(
    @InjectRepository(ChatBlockedUserEntity)
    private readonly blockedUsersRepository: Repository<ChatBlockedUserEntity>,
    private readonly blockedUsersService: ChatBlockedUsersService,
  ) {}

  /**
   * Get all blocked users (admin)
   */
  async getAllBlocked(): Promise<ChatBlockedUserEntity[]> {
    return this.blockedUsersService.findAll();
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.blockedUsersRepository.count();
    return {
      total,
    };
  }
}
