import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgDashboard Entity matching Yii AgDashboard model structure
 * Table: ag_dashboard
 */
@Entity('ag_dashboard')
export class AgDashboardEntity {
  @ApiProperty({
    description: 'Dashboard ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Dashboard name',
    example: 'Admin Dashboard',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Target users',
    example: 'admin',
    maxLength: 10,
  })
  @Column({ name: 'target_users', type: 'varchar', length: 10 })
  targetUsers: string;

  @ApiPropertyOptional({
    description: 'User ID who locked the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'int', nullable: true })
  lockedBy: number | null;

  @ApiPropertyOptional({
    description: 'User ID who created the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @ApiPropertyOptional({
    description: 'User ID who updated the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
