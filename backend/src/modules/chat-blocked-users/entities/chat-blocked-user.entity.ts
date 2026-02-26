import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Chat Blocked User Entity matching Yii ChatBlockedUsers model structure
 * Table: chat_blocked_users
 */
@Entity('chat_blocked_users')
@Index(['blockerId', 'blockedId'], { unique: true })
export class ChatBlockedUserEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID who is blocking',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'blocker_id', type: 'varchar', length: 20 })
  @Index()
  blockerId: string;

  @ApiProperty({
    description: 'User ID who is being blocked',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'blocked_id', type: 'varchar', length: 20 })
  @Index()
  blockedId: string;
}
