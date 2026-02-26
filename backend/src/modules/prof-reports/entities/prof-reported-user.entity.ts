import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ProfReportedUser Entity matching Yii ProfReportedUsers model structure
 * Table: prof_reported_users
 */
@Entity('prof_reported_users')
@Index(['senderId', 'targetId', 'reportType'])
@Index(['status'])
@Index(['createdAt'])
export class ProfReportedUserEntity {
  @ApiProperty({
    description: 'Report ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'ID of the user who submitted the report',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'sender_id', type: 'varchar', length: 20 })
  senderId: string;

  @ApiProperty({
    description: 'ID of the target (user, post, or comment) being reported',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'target_id', type: 'varchar', length: 20 })
  targetId: string;

  @ApiProperty({
    description: 'Type of report: user, post, or comment',
    example: 'user',
    enum: ['user', 'post', 'comment'],
  })
  @Column({ name: 'report_type', type: 'varchar', length: 20 })
  reportType: string;

  @ApiPropertyOptional({
    description: 'Target type ID (for posts/comments)',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'target_type_id', type: 'varchar', length: 20, nullable: true })
  targetTypeId: string | null;

  @ApiProperty({
    description: 'Reason for the report',
    example: 'spam',
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'],
  })
  @Column({ type: 'varchar', length: 50 })
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional description/details about the report',
    example: 'This user is posting spam messages repeatedly.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Status of the report',
    example: 'pending',
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  })
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @ApiPropertyOptional({
    description: 'ID of the user who reviewed the report',
    example: '507f1f77bcf86cd799439013',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'reviewed_by', type: 'varchar', length: 20, nullable: true })
  reviewedBy: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the report was reviewed',
    example: '2023-01-01T10:00:00Z',
    nullable: true,
  })
  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Resolution notes from the reviewer',
    example: 'Report reviewed and user warned.',
    nullable: true,
  })
  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2023-01-01T10:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2023-01-01T10:00:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
