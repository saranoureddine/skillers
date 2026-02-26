import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { ChatConversationsService } from './chat-conversations.service';

/**
 * Admin-only service — handles admin endpoints for chat conversations management
 */
@Injectable()
export class ChatConversationsAdminService {
  constructor(
    @InjectRepository(ChatConversationEntity)
    private readonly conversationsRepository: Repository<ChatConversationEntity>,
    private readonly conversationsService: ChatConversationsService,
  ) {}

  /**
   * Get all conversations (admin)
   */
  async getAllConversations(): Promise<ChatConversationEntity[]> {
    return this.conversationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.conversationsRepository.count();
    return {
      total,
    };
  }
}
