import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AgAttachmentEntity } from '../../attachments/entities/ag-attachment.entity';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { UpdateChatMessageDto } from '../dto/update-chat-message.dto';
import { DeleteChatMessageDto } from '../dto/delete-chat-message.dto';
import { GetMessagesBetweenUsersDto } from '../dto/get-messages-between-users.dto';
import { GetPaginatedMessagesDto } from '../dto/get-paginated-messages.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { DeleteConversationDto } from '../dto/delete-conversation.dto';
import { ChatMessagesService } from './chat-messages.service';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ChatMessagesPublicService {
  private readonly baseHost: string;
  private readonly uploadsDir: string;
  private readonly ATTACH_TABLE_MESSAGES = 'chat_messages';
  private readonly TYPE_IMAGE = 1;
  private readonly TYPE_VIDEO = 2;
  private readonly TYPE_DOCUMENT = 3;
  private readonly TYPE_AUDIO = 4;
  private readonly PRODUCTS_TABLE = 72;
  private readonly MAIN_IMAGE = 1;

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messagesRepository: Repository<ChatMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(AgAttachmentEntity)
    private readonly attachmentsRepository: Repository<AgAttachmentEntity>,
    private readonly dataSource: DataSource,
    private readonly messagesService: ChatMessagesService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Get all messages
   */
  async getAllMessages(): Promise<any> {
    try {
      const messages = await this.messagesService.findAll();
      return {
        succeeded: true,
        messages,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve messages');
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(id: number): Promise<any> {
    try {
      const message = await this.messagesService.findById(id);
      return {
        succeeded: true,
        message,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve message');
    }
  }

  /**
   * Get messages between two users
   */
  async getMessagesBetweenUsers(dto: GetMessagesBetweenUsersDto): Promise<any> {
    try {
      const { userOne, userTwo } = dto;
      const messages = await this.messagesService.findBetweenUsers(userOne, userTwo);

      const processedMessages = messages.map((message) => {
        const messageData: any = {
          ...message,
          sent_at: message.createdAt.toISOString(),
          is_sender: message.senderId === userOne,
        };
        return messageData;
      });

      return {
        succeeded: true,
        messages: processedMessages,
        conversation_info: {
          total_messages: processedMessages.length,
          last_message_time: processedMessages.length > 0 ? processedMessages[processedMessages.length - 1].sent_at : null,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get messages');
    }
  }

  /**
   * Create message
   */
  async createMessage(dto: CreateChatMessageDto): Promise<any> {
    try {
      // Check if conversation exists, create if not
      let conversation = await this.dataSource.query(
        'SELECT * FROM chat_conversations WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?) LIMIT 1',
        [dto.senderId, dto.receiverId, dto.receiverId, dto.senderId]
      );

      if (!conversation[0]) {
        // Create conversation
        await this.dataSource.query(
          'INSERT INTO chat_conversations (user_one, user_two, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [dto.senderId, dto.receiverId]
        );
        conversation = await this.dataSource.query(
          'SELECT * FROM chat_conversations WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?) LIMIT 1',
          [dto.senderId, dto.receiverId, dto.receiverId, dto.senderId]
        );
      }

      const conversationId = conversation[0].id;

      // Create message
      const message = this.messagesRepository.create({
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        message: dto.message,
        conversationId,
        messageType: dto.messageType || 'text',
        reply: dto.reply || null,
        productId: dto.productId || null,
        isRead: 0,
      });

      const saved = await this.messagesRepository.save(message);

      // Get sender info
      const sender = await this.usersRepository.findOne({ where: { id: dto.senderId } });
      const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'Unknown';

      // Format message time
      const formattedTime = this.formatMessageTime(saved.createdAt.toISOString());

      // Prepare WebSocket data
      const websocketData: any = {
        id: saved.id,
        conversation_id: saved.conversationId,
        sender_id: saved.senderId,
        receiver_id: saved.receiverId,
        sender_name: senderName,
        message: saved.message,
        message_type: saved.messageType,
        timestamp: saved.createdAt.toISOString(),
        formatted_time: formattedTime,
        is_read: false,
        reply: saved.reply,
        product_id: saved.productId,
      };

      // Add product details if exists
      if (saved.productId) {
        const productDetails = await this.getProductDetails(saved.productId);
        if (productDetails) {
          websocketData.product_details = productDetails;
        }
      }

      // TODO: Broadcast via Centrifugo
      const broadcastStatus = {
        attempted: true,
        success: false,
        channel: `skillers_${dto.receiverId}`,
        error: null,
      };

      // TODO: Send push notification

      return {
        succeeded: true,
        message: 'Message created successfully',
        chat_message: websocketData,
        broadcast_status: broadcastStatus,
        notification_status: { success: false, message: 'Not implemented' },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create message');
    }
  }

  /**
   * Update message
   */
  async updateMessage(id: number, userId: string, dto: UpdateChatMessageDto): Promise<any> {
    try {
      const message = await this.messagesService.findById(id);

      // Only sender can edit
      if (String(message.senderId) !== String(userId)) {
        throw new ForbiddenException('Access denied. You can only edit your own messages.');
      }

      if (dto.message !== undefined) {
        message.message = dto.message;
      }
      message.editedBy = userId;
      message.updatedAt = new Date();

      const updated = await this.messagesRepository.save(message);

      // Get sender info
      const sender = await this.usersRepository.findOne({ where: { id: message.senderId } });
      const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'Unknown';

      const editData = {
        message_id: updated.id,
        conversation_id: updated.conversationId,
        sender_id: updated.senderId,
        receiver_id: updated.receiverId,
        sender_name: senderName,
        message: updated.message,
        edited_by: userId,
        timestamp: updated.updatedAt.toISOString(),
        formatted_time: this.formatMessageTime(updated.updatedAt.toISOString()),
      };

      // TODO: Broadcast via Centrifugo

      return {
        succeeded: true,
        message: 'Message updated successfully',
        edit_data: editData,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update message');
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(id: number, userId: string): Promise<any> {
    try {
      const message = await this.messagesService.findById(id);

      // Verify user is sender or receiver
      if (String(message.senderId) !== String(userId) && String(message.receiverId) !== String(userId)) {
        throw new ForbiddenException('Access denied. You can only delete your own messages or messages sent to you.');
      }

      // Soft delete
      message.deletedBy = userId;
      message.updatedAt = new Date();
      await this.messagesRepository.save(message);

      const otherUserId = String(message.senderId) === String(userId) ? message.receiverId : message.senderId;

      const deleteData = {
        message_id: message.id,
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        deleted_by: userId,
        timestamp: message.updatedAt.toISOString(),
      };

      // TODO: Broadcast via Centrifugo

      return {
        succeeded: true,
        message: 'Message deleted successfully',
        delete_data: deleteData,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete message');
    }
  }

  /**
   * Upload attachment and create message
   */
  async uploadAttachment(
    dto: UploadAttachmentDto,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const messageType = dto.messageType === 'voice' ? 'audio' : (dto.messageType || 'image');
      const allowedTypes = ['image', 'video', 'document', 'audio'];
      if (!allowedTypes.includes(messageType) || messageType === 'text') {
        throw new BadRequestException('Invalid message_type');
      }

      // Save file
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const relDir = `chat/${dto.senderId}/${year}/${month}/${day}`;
      const absDir = path.join(this.uploadsDir, relDir);

      if (!fs.existsSync(absDir)) {
        fs.mkdirSync(absDir, { recursive: true });
      }

      const basename = `chat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const ext = path.extname(file.originalname).toLowerCase().substring(1);
      const savedName = `${basename}.${ext}`;
      const absPath = path.join(absDir, savedName);

      fs.writeFileSync(absPath, file.buffer);

      const relPath = path.join(relDir, savedName).replace(/\\/g, '/');
      const publicUrl = `${this.baseHost}/${relPath}`;

      // Create message
      const message = this.messagesRepository.create({
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        message: dto.message || '',
        conversationId: dto.conversationId,
        messageType,
        reply: dto.reply || null,
        productId: dto.productId || null,
        isRead: 0,
      });

      const saved = await this.messagesRepository.save(message);

      // Save attachment
      const attachment = this.attachmentsRepository.create({
        tableName: this.ATTACH_TABLE_MESSAGES,
        rowId: String(saved.id),
        type: this.mapMessageTypeToAttachmentType(messageType),
        filePath: publicUrl,
        fileName: file.originalname,
        fileExtension: ext,
        fileSize: String(file.size),
        cdnUploaded: 0,
      });

      await this.attachmentsRepository.save(attachment);

      // Get sender info
      const sender = await this.usersRepository.findOne({ where: { id: dto.senderId } });
      const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'Unknown';

      const formattedTime = this.formatMessageTime(saved.createdAt.toISOString());

      const websocketData: any = {
        id: saved.id,
        conversation_id: saved.conversationId,
        sender_id: saved.senderId,
        receiver_id: saved.receiverId,
        sender_name: senderName,
        message: saved.message,
        message_type: messageType,
        timestamp: saved.createdAt.toISOString(),
        formatted_time: formattedTime,
        is_read: false,
        reply: saved.reply,
        product_id: saved.productId,
        file: {
          url: publicUrl,
          file_path: publicUrl,
          file_name: attachment.fileName,
          file_extension: attachment.fileExtension,
          file_size: parseInt(attachment.fileSize || '0'),
          type: attachment.type,
        },
      };

      if (saved.productId) {
        const productDetails = await this.getProductDetails(saved.productId);
        if (productDetails) {
          websocketData.product_details = productDetails;
        }
      }

      // TODO: Broadcast via Centrifugo
      const broadcastStatus = {
        attempted: true,
        success: false,
        channel: `skillers_${dto.receiverId}`,
        error: null,
      };

      // TODO: Send push notification

      return {
        succeeded: true,
        message: 'Message with attachment created successfully',
        chat_message: websocketData,
        broadcast_status: broadcastStatus,
        notification_status: { success: false, message: 'Not implemented' },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload attachment');
    }
  }

  /**
   * Get paginated messages with voice calls
   */
  async getPaginatedMessages(dto: GetPaginatedMessagesDto): Promise<any> {
    try {
      const { userOne, userTwo, offset = 0, limit = 20 } = dto;

      // Get messages
      const messages = await this.messagesRepository.find({
        where: [
          { senderId: userOne, receiverId: userTwo },
          { senderId: userTwo, receiverId: userOne },
        ],
        order: { createdAt: 'DESC' },
      });

      // Get voice calls
      const voiceCalls = await this.dataSource.query(
        `SELECT * FROM voice_calls WHERE 
        (caller_id = ? AND receiver_id = ?) OR 
        (caller_id = ? AND receiver_id = ?) 
        ORDER BY created_at DESC`,
        [userOne, userTwo, userTwo, userOne]
      );

      // Combine and sort
      const allItems: any[] = [];

      messages.forEach((m) => {
        allItems.push({
          type: 'message',
          timestamp: new Date(m.createdAt).getTime(),
          data: m,
        });
      });

      voiceCalls.forEach((call: any) => {
        allItems.push({
          type: 'voice_call',
          timestamp: new Date(call.created_at).getTime(),
          data: call,
        });
      });

      allItems.sort((a, b) => b.timestamp - a.timestamp);
      const paginated = allItems.slice(offset, offset + limit).reverse();

      const processedMessages: any[] = [];

      for (const item of paginated) {
        if (item.type === 'message') {
          const m = item.data;
          const data: any = {
            ...m,
            sent_at: m.createdAt.toISOString(),
            formatted_time: this.formatMessageTime(m.createdAt.toISOString()),
            is_sender: m.senderId === userOne,
            reply: m.reply,
          };

          // Get attachment if exists
          const attachment = await this.attachmentsRepository.findOne({
            where: {
              tableName: this.ATTACH_TABLE_MESSAGES,
              rowId: String(m.id),
            },
          });

          if (attachment) {
            data.file = {
              url: this.toPublicUrl(attachment.filePath || ''),
              file_path: attachment.filePath,
              file_name: attachment.fileName,
              file_extension: attachment.fileExtension,
              file_size: parseInt(attachment.fileSize || '0'),
              type: attachment.type,
            };
            if (attachment.type !== null && attachment.type !== undefined) {
              data.message_type = this.guessMessageTypeFromAttachment(attachment.type);
            }
          }

          // Product details
          if (m.productId) {
            const productDetails = await this.getProductDetails(m.productId);
            if (productDetails) {
              data.product_details = productDetails;
            }
          }

          processedMessages.push(data);
        } else if (item.type === 'voice_call') {
          const call = item.data;
          const conversation = await this.dataSource.query(
            'SELECT id FROM chat_conversations WHERE (user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?) LIMIT 1',
            [userOne, userTwo, userTwo, userOne]
          );

          const data: any = {
            id: `call_${call.call_id}`,
            conversation_id: conversation[0]?.id || null,
            sender_id: call.caller_id,
            receiver_id: call.receiver_id,
            message: this.formatVoiceCallMessage(call),
            message_type: 'voice_call',
            sent_at: call.created_at,
            formatted_time: this.formatMessageTime(call.created_at),
            is_sender: call.caller_id === userOne,
            is_read: 1,
            reply: null,
            product_id: null,
            createdAt: call.created_at,
            updatedAt: call.updated_at || call.created_at,
            deleted_by: null,
            edited_by: null,
            voice_call_data: {
              call_id: call.call_id,
              call_type: call.type || 'voice',
              duration: call.duration,
              status: call.status,
              started_at: call.started_at,
              ended_at: call.ended_at,
              channel_name: call.channel_name || null,
            },
          };

          processedMessages.push(data);
        }
      }

      // Check block status
      const iBlocked = await this.isUserBlocked(userOne, userTwo);
      const theyBlocked = await this.isUserBlocked(userTwo, userOne);

      return {
        succeeded: true,
        type: 'messages_list',
        messages: processedMessages,
        pagination: {
          offset,
          limit,
          total_count: allItems.length,
          returned_count: processedMessages.length,
          has_more: offset + processedMessages.length < allItems.length,
        },
        conversation_info: {
          user_one: userOne,
          user_two: userTwo,
          total_messages: messages.length,
          total_voice_calls: voiceCalls.length,
          total_items: allItems.length,
          last_message_time: processedMessages.length > 0 ? processedMessages[processedMessages.length - 1].sent_at : null,
          is_blocked: iBlocked || theyBlocked,
          blocked_by: iBlocked ? userOne : theyBlocked ? userTwo : null,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get paginated messages');
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(dto: DeleteConversationDto): Promise<any> {
    try {
      const { userId, conversationId } = dto;

      // Find conversation
      const conversation = await this.dataSource.query(
        'SELECT * FROM chat_conversations WHERE id = ? LIMIT 1',
        [conversationId]
      );

      if (!conversation[0]) {
        throw new NotFoundException('Conversation not found');
      }

      const conv = conversation[0];

      // Verify user is part of conversation
      if (String(conv.user_one) !== String(userId) && String(conv.user_two) !== String(userId)) {
        throw new ForbiddenException('Access denied - You are not part of this conversation');
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Delete all messages
        await queryRunner.query('DELETE FROM chat_messages WHERE conversation_id = ?', [conversationId]);

        // Delete conversation
        await queryRunner.query('DELETE FROM chat_conversations WHERE id = ?', [conversationId]);

        await queryRunner.commitTransaction();

        const otherUserId = String(conv.user_one) === String(userId) ? conv.user_two : conv.user_one;

        // TODO: Broadcast via Centrifugo

        return {
          succeeded: true,
          message: 'Conversation deleted successfully',
          conversation_id: conversationId,
          deleted_by: userId,
          messages_deleted: 0, // Would need to get count before delete
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete conversation');
    }
  }

  // Helper methods

  private mapMessageTypeToAttachmentType(messageType: string): number {
    switch (messageType) {
      case 'image':
        return this.TYPE_IMAGE;
      case 'video':
        return this.TYPE_VIDEO;
      case 'document':
        return this.TYPE_DOCUMENT;
      case 'audio':
      case 'voice':
        return this.TYPE_AUDIO;
      default:
        return this.TYPE_IMAGE;
    }
  }

  private guessMessageTypeFromAttachment(type: number): string {
    switch (type) {
      case this.TYPE_IMAGE:
        return 'image';
      case this.TYPE_VIDEO:
        return 'video';
      case this.TYPE_DOCUMENT:
        return 'document';
      case this.TYPE_AUDIO:
        return 'audio';
      default:
        return 'file';
    }
  }

  private async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM chat_blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      [blockerId, blockedId]
    );
    return (result[0]?.count || 0) > 0;
  }

  private formatMessageTime(ts: string): string {
    try {
      const dt = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - dt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return dt.toLocaleDateString('en-US', { weekday: 'long' });
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return ts;
    }
  }

  private formatVoiceCallMessage(call: any): string {
    const duration = call.duration;
    const status = call.status;
    const callType = call.type === 'video' ? 'Video' : 'Voice';

    switch (status) {
      case 'completed':
        if (duration && duration > 0) {
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          if (minutes > 0) {
            return `${callType} call • ${minutes}m ${seconds}s`;
          } else {
            return `${callType} call • ${seconds}s`;
          }
        } else {
          return `${callType} call • Completed`;
        }
      case 'missed':
        return `Missed ${callType} call`;
      case 'declined':
        return `${callType} call declined`;
      case 'cancelled':
        return `${callType} call cancelled`;
      case 'ended':
        return `${callType} call ended`;
      default:
        return `${callType} call`;
    }
  }

  private async getProductDetails(productId: string): Promise<any> {
    if (!productId) return null;

    try {
      const product = await this.dataSource.query(
        'SELECT id, product_name, product_price FROM products WHERE id = ? LIMIT 1',
        [productId]
      );

      if (!product[0]) return null;

      const mainImage = await this.dataSource.query(
        'SELECT file_path FROM ag_attachment WHERE table_name = 72 AND type = 1 AND row_id = ? ORDER BY id ASC LIMIT 1',
        [productId]
      );

      return {
        id: product[0].id,
        name: product[0].product_name || `Product #${productId}`,
        price: product[0].product_price || null,
        image: mainImage[0] ? this.toPublicUrl(mainImage[0].file_path) : null,
      };
    } catch (e) {
      return null;
    }
  }

  private toPublicUrl(filePath: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return `${this.baseHost}/${filePath.replace(/^\/+/, '')}`;
  }
}
