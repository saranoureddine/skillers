import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';

/**
 * Shared chat conversations service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ChatConversationsService {
  constructor(
    @InjectRepository(ChatConversationEntity)
    private readonly conversationsRepository: Repository<ChatConversationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find conversation by ID
   */
  async findById(id: number): Promise<ChatConversationEntity> {
    const conversation = await this.conversationsRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  /**
   * Find conversation by user IDs
   */
  async findByUsers(userOne: string, userTwo: string): Promise<ChatConversationEntity | null> {
    return this.conversationsRepository.findOne({
      where: [
        { userOne, userTwo },
        { userOne: userTwo, userTwo: userOne },
      ],
    });
  }

  /**
   * Find all conversations for a user
   */
  async findByUserId(userId: string): Promise<ChatConversationEntity[]> {
    return this.conversationsRepository.find({
      where: [
        { userOne: userId },
        { userTwo: userId },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM chat_blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      [blockerId, blockedId],
    );
    return (result[0]?.count || 0) > 0;
  }
}
