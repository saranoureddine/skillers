import { Column, Entity, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * News Entity matching Yii News model structure
 * Table: news
 */
@Entity('news')
@Index(['status'])
@Index(['cityId'])
@Index(['expiryDate'])
export class NewsEntity {
  @ApiProperty({
    description: 'News ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'News title',
    example: 'Breaking News',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    description: 'News title (Arabic)',
    example: 'أخبار عاجلة',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'title_ar', type: 'varchar', length: 255, nullable: true })
  titleAr: string | null;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'category_id', type: 'varchar', length: 20, nullable: true })
  categoryId: string | null;

  @ApiProperty({
    description: 'News content',
    example: 'This is the news content...',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({
    description: 'News content (Arabic)',
    example: 'هذا محتوى الخبر...',
    nullable: true,
  })
  @Column({ name: 'content_ar', type: 'text', nullable: true })
  contentAr: string | null;

  @ApiProperty({
    description: 'Status',
    example: 'published',
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20 })
  status: string;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/news/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'External link',
    example: 'https://example.com',
    nullable: true,
  })
  @Column({ name: 'external_link', type: 'text', nullable: true })
  externalLink: string | null;

  @ApiProperty({
    description: 'View count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @ApiPropertyOptional({
    description: 'Published date',
    example: '2024-01-01',
    nullable: true,
  })
  @Column({ name: 'published_date', type: 'date', nullable: true })
  publishedDate: Date | null;

  @ApiPropertyOptional({
    description: 'Author',
    example: 'John Doe',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2024-12-31',
    nullable: true,
  })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

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
