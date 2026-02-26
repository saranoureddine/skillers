import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatDeletedMessageEntity } from '../entities/chat-deleted-message.entity';

/**
 * Shared chat deleted messages service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ChatDeletedMessagesService {
  constructor(
    @InjectRepository(ChatDeletedMessageEntity)
    private readonly deletedMessagesRepository: Repository<ChatDeletedMessageEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find deleted message by ID
   */
  async findById(id: number): Promise<ChatDeletedMessageEntity> {
    const deletedMessage = await this.deletedMessagesRepository.findOne({ where: { id } });
    if (!deletedMessage) {
      throw new NotFoundException(`Deleted message with ID ${id} not found`);
    }
    return deletedMessage;
  }

  /**
   * Find all deleted messages
   */
  async findAll(): Promise<ChatDeletedMessageEntity[]> {
    return this.deletedMessagesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
