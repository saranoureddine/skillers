import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { ChatMessagesService } from './chat-messages.service';

/**
 * Admin-only service — handles admin endpoints for chat messages management
 */
@Injectable()
export class ChatMessagesAdminService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messagesRepository: Repository<ChatMessageEntity>,
    private readonly messagesService: ChatMessagesService,
  ) {}

  /**
   * Get all messages (admin)
   */
  async getAllMessages(): Promise<ChatMessageEntity[]> {
    return this.messagesService.findAll();
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.messagesRepository.count();
    return {
      total,
    };
  }
}
