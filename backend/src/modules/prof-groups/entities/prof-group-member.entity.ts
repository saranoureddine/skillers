import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Prof Group Member Entity matching Yii ProfGroupMembers model structure
 * Table: prof_group_members
 */
@Entity('prof_group_members')
@Index(['groupId', 'userId'], { unique: true })
@Index(['groupId'])
@Index(['userId'])
@Index(['role'])
@Index(['isActive'])
export class ProfGroupMemberEntity {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @Column({ name: 'group_id', type: 'int' })
  @Index()
  groupId: number;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Member role',
    example: 'member',
    enum: ['admin', 'moderator', 'member'],
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20 })
  @Index()
  role: string;

  @ApiProperty({
    description: 'Joined at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'joined_at', type: 'datetime' })
  joinedAt: Date;

  @ApiPropertyOptional({
    description: 'Left at timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'left_at', type: 'datetime', nullable: true })
  leftAt: Date | null;

  @ApiProperty({
    description: 'Whether membership is active',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  @Index()
  isActive: number;
}
