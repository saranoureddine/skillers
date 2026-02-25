import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgExternalApps Entity matching Yii AgExternalApps model structure
 * Table: ag_external_apps
 */
@Entity('ag_external_apps')
export class AgExternalAppsEntity {
  @ApiProperty({
    description: 'External app ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Application name',
    example: 'External CRM',
    maxLength: 255,
  })
  @Column({ name: 'app_name', type: 'varchar', length: 255 })
  appName: string;

  @ApiProperty({
    description: 'Application link/URL',
    example: 'https://external-app.com',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  link: string;

  @ApiProperty({
    description: 'Display flag (0 or 1)',
    example: 1,
  })
  @Column({ type: 'tinyint' })
  display: number;

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/external-apps/icon.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number | null;

  @ApiPropertyOptional({
    description: 'User ID who locked the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'int', nullable: true })
  lockedBy: number | null;

  @ApiProperty({
    description: 'User ID who created the record',
    example: 1,
  })
  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @ApiPropertyOptional({
    description: 'User ID who updated the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @ApiProperty({
    description: 'Center number',
    example: 10,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

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
