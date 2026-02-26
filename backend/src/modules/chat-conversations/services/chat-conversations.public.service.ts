import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatConversationEntity } from '../entities/chat-conversation.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AgAttachmentEntity } from '../../attachments/entities/ag-attachment.entity';
import { CreateChatConversationDto } from '../dto/create-chat-conversation.dto';
import { UpdateChatConversationDto } from '../dto/update-chat-conversation.dto';
import { GetAllUsersDto } from '../dto/get-all-users.dto';
import { MarkConversationReadDto } from '../dto/mark-conversation-read.dto';
import { ChatConversationsService } from './chat-conversations.service';
import { ConfigService } from '@nestjs/config';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class ChatConversationsPublicService {
  private readonly baseHost: string;
  private readonly USERS_TABLE = 210; // Default users table ID
  private readonly MAIN_IMAGE = 1; // Default main image type
  private readonly PRODUCTS_TABLE = 72; // Default products table ID

  constructor(
    @InjectRepository(ChatConversationEntity)
    private readonly conversationsRepository: Repository<ChatConversationEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(AgAttachmentEntity)
    private readonly attachmentsRepository: Repository<AgAttachmentEntity>,
    private readonly dataSource: DataSource,
    private readonly conversationsService: ChatConversationsService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
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
   * Get profile image from AgAttachment
   */
  private async getProfileImage(userId: string, tableName: number = this.USERS_TABLE, type: number = this.MAIN_IMAGE): Promise<string | null> {
    const attachment = await this.attachmentsRepository.findOne({
      where: {
        tableName: String(tableName),
        rowId: userId,
        type,
      },
      order: { id: 'ASC' },
    });
    return attachment?.filePath || null;
  }

  /**
   * Format time for messages
   */
  private formatTime(date: Date | string): string {
    const sentTime = typeof date === 'string' ? new Date(date) : date;
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - sentTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0 || diffMonths > 0) {
      return sentTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (diffDays > 0) {
      return sentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } else {
      return sentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  }

  /**
   * Format last seen time
   */
  private formatLastSeen(lastSeen: string | Date | null): string {
    if (!lastSeen) return 'Offline';

    const lastSeenTime = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - lastSeenTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays >= 7) {
      return `Last seen ${lastSeenTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    } else if (diffDays > 0) {
      return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `Last seen ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Last seen just now';
    }
  }

  /**
   * Get all users (for chat user selection)
   */
  async getAllUsers(dto: GetAllUsersDto): Promise<any> {
    const search = (dto.search || '').trim();
    const page = Math.max(1, dto.page || 1);
    const pageSize = Math.min(200, Math.max(1, dto.pageSize || 50));
    const offset = (page - 1) * pageSize;

    try {
      // Check for privacy field
      const schemaResult = await this.dataSource.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('is_private', 'is_public', 'privacy') LIMIT 1"
      );
      const privacyField = schemaResult[0]?.COLUMN_NAME || null;

      // Build query
      let query = this.usersRepository.createQueryBuilder('u');

      if (search) {
        const searchLower = search.toLowerCase();
        const searchChars = searchLower.split('');
        const fuzzyPattern = '%' + searchChars.join('%') + '%';

        query.andWhere(
          `(
            LOWER(u.firstName) LIKE :exact OR
            LOWER(u.lastName) LIKE :exact OR
            u.phoneNumber LIKE :exact OR
            u.email LIKE :exact OR
            LOWER(u.firstName) LIKE :startsWith OR
            LOWER(u.lastName) LIKE :startsWith OR
            LOWER(u.firstName) LIKE :contains OR
            LOWER(u.lastName) LIKE :contains OR
            u.phoneNumber LIKE :contains OR
            u.email LIKE :contains OR
            LOWER(CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, ''))) LIKE :fuzzy
          )`,
          {
            exact: searchLower,
            startsWith: `${searchLower}%`,
            contains: `%${searchLower}%`,
            fuzzy: fuzzyPattern,
          }
        );
      }

      const total = await query.getCount();

      // Select fields - use raw query for privacy field handling
      query.select(['u.id', 'u.firstName', 'u.lastName', 'u.phoneNumber', 'u.email', 'u.isPublicProfile']);

      // Order by relevance
      if (search) {
        query
          .addSelect(
            `CASE 
              WHEN LOWER(u.firstName) = :exact THEN 1
              WHEN LOWER(u.lastName) = :exact THEN 1
              ELSE 2
            END`,
            'priority1'
          )
          .addSelect(
            `CASE 
              WHEN LOWER(u.firstName) LIKE :startsWith THEN 1
              WHEN LOWER(u.lastName) LIKE :startsWith THEN 1
              ELSE 2
            END`,
            'priority2'
          )
          .orderBy('priority1', 'ASC')
          .addOrderBy('priority2', 'ASC')
          .addOrderBy('LENGTH(CONCAT(COALESCE(u.firstName, ""), COALESCE(u.lastName, "")))', 'ASC')
          .addOrderBy('u.firstName', 'ASC')
          .addOrderBy('u.lastName', 'ASC');
      } else {
        query.orderBy('u.firstName', 'ASC').addOrderBy('u.lastName', 'ASC');
      }

      const users = await query.skip(offset).take(pageSize).getMany();

      // Process users
      const processedUsers = await Promise.all(
        users.map(async (user) => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

          // Determine privacy - check database for privacy field, fallback to isPublicProfile
          let privacy = 'public';
          if (privacyField) {
            // Use raw query to get privacy value
            const privacyResult = await this.dataSource.query(
              `SELECT ${privacyField} FROM users WHERE id = ? LIMIT 1`,
              [user.id]
            );
            const privacyValue = privacyResult[0]?.[privacyField];
            
            if (privacyField === 'is_private') {
              privacy = privacyValue === 1 ? 'private' : 'public';
            } else if (privacyField === 'is_public') {
              privacy = privacyValue === 1 ? 'public' : 'private';
            } else {
              privacy = ['private', 'public'].includes(String(privacyValue).toLowerCase()) ? String(privacyValue).toLowerCase() : 'public';
            }
          } else {
            // Fallback to isPublicProfile
            privacy = user.isPublicProfile === 1 ? 'public' : 'private';
          }

          // Get profile image
          const profileImage = await this.getProfileImage(user.id);

          return {
            id: user.id,
            full_name: fullName,
            phone_number: user.phoneNumber || null,
            email: user.email || null,
            privacy,
            profile_image: profileImage,
          };
        })
      );

      return {
        succeeded: true,
        users: processedUsers,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to retrieve users');
    }
  }

  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<any> {
    try {
      const conversations = await this.conversationsRepository.find();
      return {
        succeeded: true,
        conversations,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve conversations');
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(id: number): Promise<any> {
    try {
      const conversation = await this.conversationsService.findById(id);
      return {
        succeeded: true,
        conversation,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve conversation');
    }
  }

  /**
   * Create conversation
   */
  async createConversation(dto: CreateChatConversationDto): Promise<any> {
    try {
      const conversation = this.conversationsRepository.create({
        userOne: dto.userOne,
        userTwo: dto.userTwo,
        userOneRoomStatus: dto.userOneRoomStatus ? 1 : 0,
        userTwoRoomStatus: dto.userTwoRoomStatus ? 1 : 0,
        userOneTypingStatus: dto.userOneTypingStatus ? 1 : 0,
        userTwoTypingStatus: dto.userTwoTypingStatus ? 1 : 0,
      });

      const saved = await this.conversationsRepository.save(conversation);

      return {
        succeeded: true,
        message: 'Conservation created successfully',
        conservation: saved,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Conversation already exists');
      }
      throw new InternalServerErrorException('Failed to create conversation');
    }
  }

  /**
   * Update conversation
   */
  async updateConversation(id: number, dto: UpdateChatConversationDto): Promise<any> {
    try {
      const conversation = await this.conversationsService.findById(id);

      if (dto.userOneRoomStatus !== undefined) {
        conversation.userOneRoomStatus = dto.userOneRoomStatus ? 1 : 0;
      }
      if (dto.userTwoRoomStatus !== undefined) {
        conversation.userTwoRoomStatus = dto.userTwoRoomStatus ? 1 : 0;
      }
      if (dto.userOneTypingStatus !== undefined) {
        conversation.userOneTypingStatus = dto.userOneTypingStatus ? 1 : 0;
      }
      if (dto.userTwoTypingStatus !== undefined) {
        conversation.userTwoTypingStatus = dto.userTwoTypingStatus ? 1 : 0;
      }

      const updated = await this.conversationsRepository.save(conversation);

      return {
        succeeded: true,
        message: 'Conservation updated successfully',
        conservation: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update conversation');
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: number): Promise<any> {
    try {
      const conversation = await this.conversationsService.findById(id);
      await this.conversationsRepository.remove(conversation);

      return {
        succeeded: true,
        message: 'Conservation deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete conversation');
    }
  }

  /**
   * Get user conversations (complex method with messages, voice calls, blocks, etc.)
   */
  async getUserConversations(userId: string): Promise<any> {
    try {
      const conversations = await this.conversationsService.findByUserId(userId);

      const processedConversations = await Promise.all(
        conversations.map(async (conservation) => {
          // Determine other user
          const otherUserId = conservation.userOne === userId ? conservation.userTwo : conservation.userOne;

          // Get other user info
          const otherUser = await this.usersRepository.findOne({
            where: { id: otherUserId },
            select: ['id', 'firstName', 'lastName', 'phoneNumber', 'isOnline', 'lastSeen'],
          });

          if (!otherUser) {
            return null; // Skip if user not found
          }

          // Get other user image
          const otherUserImage = await this.getProfileImage(otherUserId);

          // Get last chat message
          const lastChatMessage = await this.dataSource.query(
            `SELECT * FROM chat_messages 
             WHERE conversation_id = ? 
             AND (deleted_by IS NULL OR deleted_by != ?)
             ORDER BY id DESC LIMIT 1`,
            [conservation.id, userId]
          );

          // Get last voice call
          const lastVoiceCall = await this.dataSource.query(
            `SELECT * FROM voice_calls 
             WHERE ((caller_id = ? AND receiver_id = ?) OR (caller_id = ? AND receiver_id = ?))
             ORDER BY created_at DESC LIMIT 1`,
            [conservation.userOne, conservation.userTwo, conservation.userTwo, conservation.userOne]
          );

          // Determine which is more recent
          let lastMessage: any = null;
          let isVoiceCall = false;

          const chatMessageTime = lastChatMessage[0]?.createdAt ? new Date(lastChatMessage[0].createdAt).getTime() : 0;
          const voiceCallTime = lastVoiceCall[0]?.created_at ? new Date(lastVoiceCall[0].created_at).getTime() : 0;

          if (voiceCallTime > chatMessageTime && lastVoiceCall[0]) {
            isVoiceCall = true;
            const call = lastVoiceCall[0];
            const callTypeText = call.type === 'video' ? 'Video call' : 'Voice call';
            let messageText = '';

            if (call.status === 'ended' && call.duration > 0) {
              const minutes = Math.floor(call.duration / 60);
              const seconds = call.duration % 60;
              messageText = `${callTypeText} • ${minutes}m ${seconds}s`;
            } else {
              const statusMap: Record<string, string> = {
                missed: `Missed ${callTypeText.toLowerCase()}`,
                declined: `${callTypeText} declined`,
                cancelled: `${callTypeText} cancelled`,
                ended: `${callTypeText} ended`,
              };
              messageText = statusMap[call.status] || callTypeText;
            }

            lastMessage = {
              id: `call_${call.call_id}`,
              conversation_id: conservation.id,
              sender_id: call.caller_id,
              receiver_id: call.receiver_id,
              message: messageText,
              message_type: 'voice_call',
              sent_at: call.created_at,
              formatted_time: this.formatTime(call.created_at),
              is_read: true,
              product_id: null,
              product_details: null,
              voice_call_data: {
                call_id: call.call_id,
                call_type: call.type,
                caller_id: call.caller_id,
                receiver_id: call.receiver_id,
                status: call.status,
                duration: call.duration,
                started_at: call.started_at,
                ended_at: call.ended_at,
              },
              deleted_by: null,
              edited_by: null,
            };
          } else if (lastChatMessage[0]) {
            const msg = lastChatMessage[0];
            let productDetails: {
              id: any;
              title: any;
              price: any;
              discount: any;
              image: string | null;
            } | null = null;

            // Get product details if exists
            if (msg.product_id) {
              const product = await this.dataSource.query(
                'SELECT * FROM products WHERE id = ? LIMIT 1',
                [msg.product_id]
              );

              if (product[0]) {
                const productImage = await this.getProfileImage(String(product[0].id), this.PRODUCTS_TABLE);
                productDetails = {
                  id: product[0].id,
                  title: product[0].title || product[0].product_name || null,
                  price: product[0].price || product[0].product_price || null,
                  discount: product[0].discount || product[0].product_discount || null,
                  image: productImage,
                };
              }
            }

            lastMessage = {
              id: msg.id,
              conversation_id: msg.conversation_id,
              sender_id: msg.sender_id,
              receiver_id: msg.receiver_id,
              message: msg.message,
              message_type: msg.message_type,
              sent_at: msg.createdAt || msg.created_at,
              formatted_time: this.formatTime(msg.createdAt || msg.created_at),
              is_read: Boolean(msg.is_read),
              product_id: msg.product_id,
              product_details: productDetails,
              voice_call_data: null,
              deleted_by: msg.deleted_by,
              edited_by: msg.edited_by,
            };
          }

          // Get unread count
          const unreadResult = await this.dataSource.query(
            `SELECT COUNT(*) as count FROM chat_messages 
             WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0 AND deleted_by IS NULL`,
            [conservation.id, userId]
          );
          const unreadCount = unreadResult[0]?.count || 0;

          // Check blocks
          const blockedByMe = await this.conversationsService.isUserBlocked(userId, otherUserId);
          const blockedMe = await this.conversationsService.isUserBlocked(otherUserId, userId);
          const blockedEitherDirection = blockedByMe || blockedMe;

          // Online status with block check
          let isOnline = false;
          let lastSeen: string | null = null;
          let statusText = 'Offline';
          const statusHidden = blockedEitherDirection;

          if (!statusHidden) {
            isOnline = Boolean(otherUser.isOnline);
            lastSeen = otherUser.lastSeen ? (otherUser.lastSeen instanceof Date ? otherUser.lastSeen.toISOString() : String(otherUser.lastSeen)) : null;

            if (isOnline) {
              statusText = 'Online';
            } else if (lastSeen) {
              statusText = this.formatLastSeen(lastSeen);
            }
          }

          return {
            id: conservation.id,
            user_one: conservation.userOne,
            user_two: conservation.userTwo,
            createdAt: conservation.createdAt ? conservation.createdAt.toISOString() : null,
            updatedAt: conservation.updatedAt ? conservation.updatedAt.toISOString() : null,
            other_user_info: {
              id: otherUser.id,
              first_name: otherUser.firstName,
              last_name: otherUser.lastName,
              phone_number: otherUser.phoneNumber,
              image: otherUserImage,
            },
            status: {
              is_online: isOnline,
              last_seen: lastSeen,
              status_text: statusText,
              status_hidden: statusHidden,
            },
            block_status: {
              is_blocked: blockedEitherDirection,
              i_blocked_them: blockedByMe,
              they_blocked_me: blockedMe,
              blocked_by: blockedByMe ? userId : blockedMe ? otherUserId : null,
              can_send_messages: !blockedMe,
              will_receive_messages: !blockedByMe,
            },
            is_blocked: blockedEitherDirection,
            blocked_by: blockedByMe ? userId : blockedMe ? otherUserId : null,
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        })
      );

      // Filter out null entries
      const validConversations = processedConversations.filter((c) => c !== null);

      return {
        succeeded: true,
        conversations: validConversations,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve user conversations');
    }
  }

  /**
   * Mark conversation as read
   */
  async markConversationRead(dto: MarkConversationReadDto): Promise<any> {
    try {
      const { conversationId, readerId } = dto;

      // Verify conversation exists and reader is participant
      const conversation = await this.conversationsService.findById(conversationId);
      if (conversation.userOne !== readerId && conversation.userTwo !== readerId) {
        throw new NotFoundException('Conversation not found or access denied');
      }

      // Get unread messages
      const unreadMessages = await this.dataSource.query(
        `SELECT * FROM chat_messages 
         WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0 AND deleted_by IS NULL`,
        [conversationId, readerId]
      );

      if (unreadMessages.length === 0) {
        return {
          succeeded: true,
          message: 'No unread messages to mark',
          conversation_id: conversationId,
          reader_id: readerId,
          updated_count: 0,
          timestamp: new Date().toISOString(),
        };
      }

      // Mark messages as read
      const now = new Date().toISOString();
      const updatedIds: number[] = [];

      for (const message of unreadMessages) {
        await this.dataSource.query(
          'UPDATE chat_messages SET is_read = 1, updated_at = ? WHERE id = ?',
          [now, message.id]
        );
        updatedIds.push(message.id);
      }

      // TODO: Broadcast via Centrifugo (would need Centrifugo service)
      // For now, just return success

      return {
        succeeded: true,
        message: 'Conversation marked as read',
        conversation_id: conversationId,
        reader_id: readerId,
        updated_count: updatedIds.length,
        message_ids: updatedIds,
        timestamp: now,
        broadcast_status: {
          sent: false, // TODO: Implement Centrifugo broadcasting
          channel: `skillers_${conversation.userOne === readerId ? conversation.userTwo : conversation.userOne}`,
          error: null,
          response: null,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to mark conversation as read');
    }
  }
}
