import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Modules Entity matching Yii Modules model structure
 * Table: modules
 */
@Entity('modules')
@Index(['display'])
@Index(['orderNumber'])
export class ModulesEntity {
  @ApiProperty({
    description: 'Module ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Module name',
    example: 'Marketplace',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiPropertyOptional({
    description: 'Module name (Arabic)',
    example: 'السوق',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'name_ar', type: 'varchar', length: 100, nullable: true })
  nameAr: string | null;

  @ApiPropertyOptional({
    description: 'Module description',
    example: 'Buy and sell products',
    maxLength: 500,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Module description (Arabic)',
    example: 'بيع وشراء المنتجات',
    maxLength: 500,
    nullable: true,
  })
  @Column({ name: 'description_ar', type: 'varchar', length: 500, nullable: true })
  descriptionAr: string | null;

  @ApiPropertyOptional({
    description: 'Order number for sorting',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber: number | null;

  @ApiProperty({
    description: 'Display flag (1 = display, 0 = hide)',
    example: 1,
    default: 1,
  })
  @Column({ type: 'tinyint', default: 1 })
  display: number;

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/modules/marketplace.png',
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
