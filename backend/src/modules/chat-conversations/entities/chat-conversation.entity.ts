import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Chat Conversation Entity matching Yii ChatConservation model structure
 * Table: chat_conversations
 */
@Entity('chat_conversations')
@Index(['userOne', 'userTwo'])
export class ChatConversationEntity extends BaseEntity {
  @ApiProperty({
    description: 'First user ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_one', type: 'varchar', length: 20 })
  @Index()
  userOne: string;

  @ApiProperty({
    description: 'Second user ID (20 character string)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'user_two', type: 'varchar', length: 20 })
  @Index()
  userTwo: string;

  @ApiPropertyOptional({
    description: 'User one room status',
    example: false,
    default: false,
  })
  @Column({ name: 'user_one_room_status', type: 'tinyint', default: 0 })
  userOneRoomStatus: number;

  @ApiPropertyOptional({
    description: 'User two room status',
    example: false,
    default: false,
  })
  @Column({ name: 'user_two_room_status', type: 'tinyint', default: 0 })
  userTwoRoomStatus: number;

  @ApiPropertyOptional({
    description: 'User one typing status',
    example: false,
    default: false,
  })
  @Column({ name: 'user_one_typing_status', type: 'tinyint', default: 0 })
  userOneTypingStatus: number;

  @ApiPropertyOptional({
    description: 'User two typing status',
    example: false,
    default: false,
  })
  @Column({ name: 'user_two_typing_status', type: 'tinyint', default: 0 })
  userTwoTypingStatus: number;
}
