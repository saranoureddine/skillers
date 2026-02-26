import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Profession User Entity matching Yii ProfessionUser model structure
 * Table: profession_user
 */
@Entity('profession_user')
@Index(['userId', 'professionId'], { unique: true })
@Index(['userId'])
@Index(['professionId'])
@Index(['isPrimary'])
@Index(['isVerified'])
export class ProfessionUserEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Profession ID (prof_categories subcategory)',
    example: 1,
  })
  @Column({ name: 'profession_id', type: 'int' })
  @Index()
  professionId: number;

  @ApiProperty({
    description: 'Whether this is the primary profession',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_primary', type: 'tinyint', default: 0 })
  @Index()
  isPrimary: number;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
    nullable: true,
  })
  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number | null;

  @ApiProperty({
    description: 'Whether profession is verified',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_verified', type: 'tinyint', default: 0 })
  @Index()
  isVerified: number;

  @ApiPropertyOptional({
    description: 'Verification timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'verified_at', type: 'datetime', nullable: true })
  verifiedAt: Date | null;

  @ApiPropertyOptional({
    description: 'User ID who verified',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'verified_by', type: 'varchar', length: 20, nullable: true })
  verifiedBy: string | null;
}
