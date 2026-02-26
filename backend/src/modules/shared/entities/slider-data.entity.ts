import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Slider Data Entity matching Yii SliderData model structure
 * Table: slider_data
 */
@Entity('slider_data')
@Index(['sliderType'])
@Index(['cityId'])
@Index(['showHide'])
export class SliderDataEntity {
  @ApiProperty({
    description: 'Slider ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Slider type',
    example: 'image',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  type: string;

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/slider/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiPropertyOptional({
    description: 'Text content',
    example: 'Welcome to our platform',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  text: string | null;

  @ApiPropertyOptional({
    description: 'External link',
    example: 'https://example.com',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'external_link', type: 'varchar', length: 255, nullable: true })
  externalLink: string | null;

  @ApiPropertyOptional({
    description: 'Slider type (home, municipality, etc.)',
    example: 'home',
    maxLength: 50,
    nullable: true,
  })
  @Column({ name: 'slider_type', type: 'varchar', length: 50, nullable: true })
  sliderType: string | null;

  @ApiPropertyOptional({
    description: 'Reference ID (e.g., store ID)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'ref_id', type: 'varchar', length: 20, nullable: true })
  refId: string | null;

  @ApiPropertyOptional({
    description: 'Order number for sorting',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber: number | null;

  @ApiPropertyOptional({
    description: 'Show/Hide flag (1 = show, 0 = hide)',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'show_hide', type: 'tinyint', nullable: true })
  showHide: number | null;

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
