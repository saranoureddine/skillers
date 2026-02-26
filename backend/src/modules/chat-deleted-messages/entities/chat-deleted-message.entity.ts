import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Chat Deleted Message Entity matching Yii ChatDeletedMessages model structure
 * Table: chat_deleted_messages
 */
@Entity('chat_deleted_messages')
@Index(['messageId'])
@Index(['deletedBy'])
export class ChatDeletedMessageEntity extends BaseEntity {
  @ApiProperty({
    description: 'Message ID that was deleted',
    example: 1,
  })
  @Column({ name: 'message_id', type: 'int' })
  @Index()
  messageId: number;

  @ApiProperty({
    description: 'User ID who deleted the message',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'deleted_by', type: 'varchar', length: 20 })
  @Index()
  deletedBy: string;
}
