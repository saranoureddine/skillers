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
 * ProfCategory Entity matching Yii ProfCategories model structure
 * Table: prof_categories
 */
@Entity('prof_categories')
@Index(['parentId'])
@Index(['isActive'])
@Index(['isTop'])
export class ProfCategoryEntity {
  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Medical',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiPropertyOptional({
    description: 'Category name in Arabic',
    example: 'طبي',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Medical professionals and services',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Category description in Arabic',
    example: 'المهنيين الطبيين والخدمات',
    nullable: true,
  })
  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string | null;

  @ApiPropertyOptional({
    description: 'Parent category ID (null for top-level categories)',
    example: null,
    nullable: true,
  })
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @ApiProperty({
    description: 'Whether the category is active',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiProperty({
    description: 'Sort order for display',
    example: 1,
    default: 0,
  })
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ApiPropertyOptional({
    description: 'Icon attachment ID',
    example: 123,
    nullable: true,
  })
  @Column({ name: 'icon_attachment_id', type: 'int', nullable: true })
  iconAttachmentId: number | null;

  @ApiPropertyOptional({
    description: 'Whether subcategory is marked as top',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'is_top', type: 'tinyint', nullable: true, default: 0 })
  isTop: number | null;

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

  @ApiPropertyOptional({
    description: 'User ID who created the record',
    example: 'user_created_by_id',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20, nullable: true })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'User ID who last updated the record',
    example: 'user_updated_by_id',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;
}
