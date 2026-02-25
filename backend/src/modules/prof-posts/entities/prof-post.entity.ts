import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  POLL = 'poll',
  ARTICLE = 'article',
}

/**
 * ProfPost Entity matching Yii ProfPosts model structure
 * Table: prof_posts
 */
@Entity('prof_posts')
@Index(['userId'])
@Index(['isDeleted', 'isPublic'])
@Index(['isPinned', 'createdAt'])
export class ProfPostEntity {
  @ApiProperty({
    description: 'Post ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who created the post',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is my first professional post!',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({
    description: 'Post description',
    example: 'Additional details about the post',
    maxLength: 500,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Post type',
    enum: PostType,
    example: PostType.TEXT,
    default: PostType.TEXT,
  })
  @Column({ name: 'post_type', type: 'varchar', length: 50, default: PostType.TEXT })
  postType: PostType;

  @ApiProperty({
    description: 'Is deleted flag (soft delete)',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;

  @ApiPropertyOptional({
    description: 'Deleted timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({
    description: 'User ID who deleted the post',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'deleted_by', type: 'varchar', length: 20, nullable: true })
  deletedBy: string | null;

  @ApiPropertyOptional({
    description: 'Attachment ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'attachment_id', type: 'int', nullable: true })
  attachmentId: number | null;

  @ApiProperty({
    description: 'Likes count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @ApiProperty({
    description: 'Comments count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount: number;

  @ApiProperty({
    description: 'Shares count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'shares_count', type: 'int', default: 0 })
  sharesCount: number;

  @ApiProperty({
    description: 'Views count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount: number;

  @ApiProperty({
    description: 'Is pinned flag',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_pinned', type: 'tinyint', default: 0 })
  isPinned: number;

  @ApiPropertyOptional({
    description: 'Pinned timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'pinned_at', type: 'datetime', nullable: true })
  pinnedAt: Date | null;

  @ApiProperty({
    description: 'Is public flag',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_public', type: 'tinyint', default: 1 })
  isPublic: number;

  @ApiProperty({
    description: 'Post creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Post update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
