import { Column, Entity, PrimaryColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SuggestionsClaimsRatings Entity matching Yii SuggestionsClaimsRatings model structure
 * Table: suggestion_claim_ratings
 */
@Entity('suggestion_claim_ratings')
@Index(['suggestionClaimId'])
@Index(['userId'])
export class SuggestionsClaimsRatingsEntity {
  @ApiProperty({
    description: 'Rating ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Suggestion/Claim ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'suggestion_claim_id', type: 'varchar', length: 20 })
  suggestionClaimId: string;

  @ApiProperty({
    description: 'User ID (can be from users or ag_users table)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  rating: number;

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
