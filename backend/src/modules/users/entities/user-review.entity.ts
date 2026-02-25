import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UserReview Entity matching Yii UsersReviews model structure
 * Table: users_reviews
 */
@Entity('users_reviews')
@Index(['userId'])
@Index(['ownerUserId'])
@Index(['storeId'])
export class UserReviewEntity {
  @ApiProperty({
    description: 'Review ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text/comment',
    example: 'Great service and professional work!',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  text: string | null;

  @ApiProperty({
    description: 'User ID who wrote the review',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiPropertyOptional({
    description: 'Owner User ID (user being reviewed)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'owner_user_id', type: 'varchar', length: 20, nullable: true })
  ownerUserId: string | null;

  @ApiPropertyOptional({
    description: 'Store ID',
    example: '507f1f77bcf86cd799439013',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'store_id', type: 'varchar', length: 20, nullable: true })
  storeId: string | null;

  @ApiProperty({
    description: 'Review creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
