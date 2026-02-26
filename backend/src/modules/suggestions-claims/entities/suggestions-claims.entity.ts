import { Column, Entity, PrimaryColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * SuggestionsClaims Entity matching Yii SuggestionsClaims model structure
 * Table: suggestions_claims
 */
@Entity('suggestions_claims')
@Index(['city_id'])
@Index(['category_id'])
@Index(['status'])
@Index(['created_at'])
export class SuggestionsClaimsEntity {
  @ApiProperty({
    description: 'Suggestion/Claim ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @Column({ name: 'city_id', type: 'int' })
  cityId: number;

  @ApiProperty({
    description: 'Details/Description',
    example: 'This is a suggestion about improving the city infrastructure.',
  })
  @Column({ type: 'text' })
  details: string;

  @ApiProperty({
    description: 'Type: suggestion or claim',
    example: 'suggestion',
    enum: ['suggestion', 'claim'],
  })
  @Column({ type: 'varchar', length: 20 })
  type: 'suggestion' | 'claim';

  @ApiPropertyOptional({
    description: 'Reply from admin',
    example: 'Thank you for your suggestion. We will review it.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  reply: string | null;

  @ApiProperty({
    description: 'Whether the suggestion/claim has been replied to',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_replied', type: 'tinyint', default: 0 })
  isReplied: number;

  @ApiProperty({
    description: 'Status: pending, accepted, rejected, resolved',
    example: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'resolved'],
    default: 'pending',
  })
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected' | 'resolved';

  @ApiPropertyOptional({
    description: 'Created by user ID (from users table)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20, nullable: true })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'Created by admin ID (from ag_users table)',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'created_by_admin', type: 'varchar', length: 20, nullable: true })
  createdByAdmin: string | null;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
    default: 0.0,
  })
  @Column({ name: 'average_rating', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  averageRating: number;

  @ApiProperty({
    description: 'Total ratings count',
    example: 10,
    default: 0,
  })
  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
