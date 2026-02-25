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
 * ProfComment Entity matching Yii ProfComments model structure
 * Table: prof_comments
 */
@Entity('prof_comments')
@Index(['postId'])
@Index(['userId'])
@Index(['parentId'])
@Index(['isDeleted'])
export class ProfCommentEntity {
  @ApiProperty({
    description: 'Comment ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Post ID',
    example: 1,
  })
  @Column({ name: 'post_id', type: 'int' })
  postId: number;

  @ApiProperty({
    description: 'User ID who created the comment',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID (for replies)',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @ApiProperty({
    description: 'Comment content',
    example: 'Great post! Thanks for sharing.',
  })
  @Column({ type: 'text' })
  content: string;

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
    description: 'User ID who deleted the comment',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'deleted_by', type: 'varchar', length: 20, nullable: true })
  deletedBy: string | null;

  @ApiProperty({
    description: 'Likes count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @ApiProperty({
    description: 'Replies count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'replies_count', type: 'int', default: 0 })
  repliesCount: number;

  @ApiPropertyOptional({
    description: 'Is edited flag',
    example: 0,
    default: 0,
    nullable: true,
  })
  @Column({ name: 'is_edited', type: 'tinyint', default: 0, nullable: true })
  isEdited: number | null;

  @ApiProperty({
    description: 'Comment creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Comment update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
