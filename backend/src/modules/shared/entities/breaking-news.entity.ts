import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Breaking News Entity
 * Table: breaking_news
 */
@Entity('breaking_news')
@Index(['isActive'])
@Index(['cityId'])
@Index(['expiryDate'])
export class BreakingNewsEntity {
  @ApiProperty({
    description: 'Breaking News ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Text content (English)',
    example: 'Important announcement',
  })
  @Column({ type: 'text' })
  text: string;

  @ApiPropertyOptional({
    description: 'Text content (Arabic)',
    example: 'إعلان مهم',
    nullable: true,
  })
  @Column({ name: 'text_ar', type: 'text', nullable: true })
  textAr: string | null;

  @ApiProperty({
    description: 'Is active (1 = active, 0 = inactive)',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2024-12-31',
    nullable: true,
  })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
