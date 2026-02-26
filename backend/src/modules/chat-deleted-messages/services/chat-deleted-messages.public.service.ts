import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatDeletedMessageEntity } from '../entities/chat-deleted-message.entity';
import { CreateChatDeletedMessageDto } from '../dto/create-chat-deleted-message.dto';
import { ChatDeletedMessagesService } from './chat-deleted-messages.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ChatDeletedMessagesPublicService {
  constructor(
    @InjectRepository(ChatDeletedMessageEntity)
    private readonly deletedMessagesRepository: Repository<ChatDeletedMessageEntity>,
    private readonly dataSource: DataSource,
    private readonly deletedMessagesService: ChatDeletedMessagesService,
  ) {}

  /**
   * Get all deleted messages
   */
  async getAllDeleted(): Promise<any> {
    try {
      const deleted = await this.deletedMessagesService.findAll();
      return {
        succeeded: true,
        deleted_messages: deleted,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve deleted messages');
    }
  }

  /**
   * Get deleted message by ID
   */
  async getDeletedById(id: number): Promise<any> {
    try {
      const deleted = await this.deletedMessagesService.findById(id);
      return {
        succeeded: true,
        deleted_message: deleted,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve deleted message');
    }
  }

  /**
   * Create deleted message (marks message as deleted)
   */
  async createDeleted(dto: CreateChatDeletedMessageDto): Promise<any> {
    try {
      const { messageId, deletedBy } = dto;

      // Validate required fields
      if (!messageId || !deletedBy) {
        throw new BadRequestException('Missing required fields: message_id and deleted_by');
      }

      // Update chat_messages table to set deleted_by
      const chatMessageResult = await this.dataSource.query(
        'SELECT * FROM chat_messages WHERE id = ? LIMIT 1',
        [messageId]
      );

      if (chatMessageResult[0]) {
        await this.dataSource.query(
          'UPDATE chat_messages SET deleted_by = ? WHERE id = ?',
          [deletedBy, messageId]
        );
      }

      // Create deleted message record
      const deletedMessage = this.deletedMessagesRepository.create({
        messageId,
        deletedBy,
      });

      const saved = await this.deletedMessagesRepository.save(deletedMessage);

      return {
        succeeded: true,
        message: 'Deleted message created successfully',
        deleted_message: saved,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create deleted message');
    }
  }
}
