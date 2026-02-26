import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatMessageEntity } from '../entities/chat-message.entity';

/**
 * Shared chat messages service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messagesRepository: Repository<ChatMessageEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find message by ID
   */
  async findById(id: number): Promise<ChatMessageEntity> {
    const message = await this.messagesRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  /**
   * Find all messages
   */
  async findAll(): Promise<ChatMessageEntity[]> {
    return this.messagesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find messages between two users
   */
  async findBetweenUsers(userOne: string, userTwo: string): Promise<ChatMessageEntity[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userOne, receiverId: userTwo },
        { senderId: userTwo, receiverId: userOne },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find messages by conversation ID
   */
  async findByConversationId(conversationId: number): Promise<ChatMessageEntity[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });
  }
}
