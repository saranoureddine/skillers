import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatDeletedMessageEntity } from '../entities/chat-deleted-message.entity';
import { ChatDeletedMessagesService } from './chat-deleted-messages.service';

/**
 * Admin-only service — handles admin endpoints for chat deleted messages management
 */
@Injectable()
export class ChatDeletedMessagesAdminService {
  constructor(
    @InjectRepository(ChatDeletedMessageEntity)
    private readonly deletedMessagesRepository: Repository<ChatDeletedMessageEntity>,
    private readonly deletedMessagesService: ChatDeletedMessagesService,
  ) {}

  /**
   * Get all deleted messages (admin)
   */
  async getAllDeleted(): Promise<ChatDeletedMessageEntity[]> {
    return this.deletedMessagesService.findAll();
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.deletedMessagesRepository.count();
    return {
      total,
    };
  }
}
