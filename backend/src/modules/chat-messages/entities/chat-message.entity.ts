import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Chat Message Entity matching Yii ChatMessages model structure
 * Table: chat_messages
 */
@Entity('chat_messages')
@Index(['conversationId'])
@Index(['senderId'])
@Index(['receiverId'])
export class ChatMessageEntity extends BaseEntity {
  @ApiProperty({
    description: 'Conversation ID',
    example: 1,
  })
  @Column({ name: 'conversation_id', type: 'int' })
  @Index()
  conversationId: number;

  @ApiProperty({
    description: 'Sender user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'sender_id', type: 'varchar', length: 20 })
  @Index()
  senderId: string;

  @ApiProperty({
    description: 'Receiver user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'receiver_id', type: 'varchar', length: 20 })
  @Index()
  receiverId: string;

  @ApiPropertyOptional({
    description: 'Message content',
    example: 'Hello, how are you?',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiPropertyOptional({
    description: 'Message type',
    example: 'text',
    enum: ['text', 'image', 'video', 'document', 'audio', 'voice', 'file', 'location', 'chat'],
    maxLength: 20,
  })
  @Column({ name: 'message_type', type: 'varchar', length: 20, nullable: true })
  messageType: string | null;

  @ApiPropertyOptional({
    description: 'File URL',
    example: 'https://example.com/file.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: true })
  fileUrl: string | null;

  @ApiPropertyOptional({
    description: 'File name',
    example: 'image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @ApiPropertyOptional({
    description: 'File extension',
    example: 'jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_extension', type: 'varchar', length: 255, nullable: true })
  fileExtension: string | null;

  @ApiPropertyOptional({
    description: 'File size',
    example: '1024',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'file_size', type: 'varchar', length: 255, nullable: true })
  fileSize: string | null;

  @ApiPropertyOptional({
    description: 'Whether message is read',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  @ApiPropertyOptional({
    description: 'User ID who deleted the message',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'deleted_by', type: 'varchar', length: 20, nullable: true })
  deletedBy: string | null;

  @ApiPropertyOptional({
    description: 'User ID who edited the message',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'edited_by', type: 'varchar', length: 20, nullable: true })
  editedBy: string | null;

  @ApiPropertyOptional({
    description: 'Reply to message ID',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  reply: number | null;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: '507f1f77bcf86cd799439013',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'product_id', type: 'varchar', length: 20, nullable: true })
  productId: string | null;
}
