import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Prof Follow Entity matching Yii ProfFollow model structure
 * Table: prof_follow
 */
@Entity('prof_follow')
@Index(['followerId', 'followingId'], { unique: true })
@Index(['followerId'])
@Index(['followingId'])
@Index(['status'])
export class ProfFollowEntity extends BaseEntity {
  @ApiProperty({
    description: 'Follower user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'follower_id', type: 'varchar', length: 20 })
  @Index()
  followerId: string;

  @ApiProperty({
    description: 'Following user ID (the user being followed)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'following_id', type: 'varchar', length: 20 })
  @Index()
  followingId: string;

  @ApiProperty({
    description: 'Follow status',
    example: 'following',
    enum: ['following', 'blocked', 'muted'],
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20 })
  @Index()
  status: string;

  @ApiPropertyOptional({
    description: 'Followed at timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'followed_at', type: 'datetime', nullable: true })
  followedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Unfollowed at timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'unfollowed_at', type: 'datetime', nullable: true })
  unfollowedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Blocked at timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'blocked_at', type: 'datetime', nullable: true })
  blockedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Muted at timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'muted_at', type: 'datetime', nullable: true })
  mutedAt: Date | null;
}
