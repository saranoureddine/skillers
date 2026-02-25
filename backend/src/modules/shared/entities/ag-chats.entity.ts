import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgChats Entity matching Yii AgChats model structure
 * Table: ag_chats
 */
@Entity('ag_chats')
@Index(['senderId', 'targetId'])
export class AgChatsEntity {
  @ApiProperty({
    description: 'Chat message ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'Sender user ID',
    example: 12345,
    nullable: true,
  })
  @Column({ name: 'sender_id', type: 'int', nullable: true })
  senderId: number | null;

  @ApiPropertyOptional({
    description: 'Target user ID',
    example: 67890,
    nullable: true,
  })
  @Column({ name: 'target_id', type: 'int', nullable: true })
  targetId: number | null;

  @ApiPropertyOptional({
    description: 'Message sent timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  sentAt: Date | null;

  @ApiPropertyOptional({
    description: 'Message read timestamp',
    example: '2026-02-24T12:05:00.000Z',
    nullable: true,
  })
  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @ApiPropertyOptional({
    description: 'Message content',
    example: 'Hello, how are you?',
    nullable: true,
  })
  @Column({ name: 'message_content', type: 'text', nullable: true })
  messageContent: string | null;

  @ApiPropertyOptional({
    description: 'Local file path',
    example: '/uploads/chats/file.mp3',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'local_path', type: 'varchar', length: 255, nullable: true })
  localPath: string | null;

  @ApiPropertyOptional({
    description: 'Duration (for voice/video messages)',
    example: '00:05:30',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  duration: string | null;

  @ApiPropertyOptional({
    description: 'Attachment IDs',
    example: 123,
    nullable: true,
  })
  @Column({ name: 'attachment_ids', type: 'int', nullable: true })
  attachmentIds: number | null;

  @ApiPropertyOptional({
    description: 'Message type',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  type: number | null;

  @ApiPropertyOptional({
    description: 'Message status',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  status: number | null;
}
