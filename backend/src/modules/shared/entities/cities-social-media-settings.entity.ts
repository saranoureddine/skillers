import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Cities Social Media Settings Entity matching Yii CitiesSocialMediaSettings model structure
 * Table: cities_social_media_settings
 */
@Entity('cities_social_media_settings')
@Index(['display'])
@Index(['cityId'])
export class CitiesSocialMediaSettingsEntity {
  @ApiProperty({
    description: 'City Social Media Setting ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Social media link URL',
    example: 'https://facebook.com/city',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  link: string;

  @ApiProperty({
    description: 'Display flag (1 = display, 0 = hide)',
    example: 1,
    default: 1,
  })
  @Column({ type: 'tinyint', default: 1 })
  display: number;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @Column({ name: 'city_id', type: 'int' })
  cityId: number;

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/social/facebook.png',
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
    description: 'Locked by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Center number',
    example: 1,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
