import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MENTION = 'mention',
  POST_SHARED = 'post_shared',
  COMMENT_REPLY = 'comment_reply',
  SYSTEM = 'system',
}

/**
 * ProfNotification Entity matching Yii ProfNotifications model structure
 * Table: prof_notifications (or notifications in Yii)
 */
@Entity('prof_notifications')
@Index(['userId'])
@Index(['userId', 'isRead'])
@Index(['type'])
export class ProfNotificationEntity {
  @ApiProperty({
    description: 'Notification ID (string format matching Yii API)',
    example: '10258-1a27',
    maxLength: 50,
  })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @ApiProperty({
    description: 'User ID who receives the notification',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.LIKE,
  })
  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Like',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'John Doe liked your post',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional data (JSON string)',
    example: '{"post_id": 1, "liker_id": "507f1f77bcf86cd799439011"}',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  data: string | null;

  @ApiProperty({
    description: 'Is read flag',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  @ApiPropertyOptional({
    description: 'Read timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @ApiProperty({
    description: 'Notification creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
