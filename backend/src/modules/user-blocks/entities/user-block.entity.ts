import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UserBlock Entity matching Yii UserBlocks model structure
 * Table: user_blocks
 */
@Entity('user_blocks')
@Index(['blockerId', 'blockedId'], { unique: true })
export class UserBlockEntity {
  @ApiProperty({
    description: 'Block ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who is blocking',
    example: 'e87b786bac5234367b4a',
    maxLength: 20,
  })
  @Column({ name: 'blocker_id', type: 'varchar', length: 20 })
  blockerId: string;

  @ApiProperty({
    description: 'User ID who is being blocked',
    example: 'f98c897cbd6345478c5b',
    maxLength: 20,
  })
  @Column({ name: 'blocked_id', type: 'varchar', length: 20 })
  blockedId: string;

  @ApiPropertyOptional({
    description: 'Reason for blocking',
    example: 'Inappropriate behavior',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @ApiProperty({
    description: 'Block creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
