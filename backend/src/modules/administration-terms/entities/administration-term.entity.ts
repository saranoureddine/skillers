import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AdministrationTerm Entity matching Yii AdministrationTerms model structure
 * Table: administration_terms
 */
@Entity('administration_terms')
@Index(['cityId', 'fromYear', 'toYear'], { unique: true })
export class AdministrationTermEntity {
  @ApiProperty({
    description: 'Administration term ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @Column({ name: 'city_id', type: 'int' })
  cityId: number;

  @ApiProperty({
    description: 'Administration term start year',
    example: 2020,
  })
  @Column({ name: 'from_year', type: 'int' })
  fromYear: number;

  @ApiProperty({
    description: 'Administration term end year',
    example: 2024,
  })
  @Column({ name: 'to_year', type: 'int' })
  toYear: number;

  @ApiProperty({
    description: 'Whether the term is active',
    example: true,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiPropertyOptional({
    description: 'Title in English',
    example: 'Administration Term 2020-2024',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'title_en', type: 'varchar', length: 100, nullable: true })
  titleEn: string | null;

  @ApiPropertyOptional({
    description: 'Title in Arabic',
    example: 'فترة الإدارة 2020-2024',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'title_ar', type: 'varchar', length: 100, nullable: true })
  titleAr: string | null;

  @ApiPropertyOptional({
    description: 'Description in English',
    example: 'Administration term description',
    nullable: true,
  })
  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null;

  @ApiPropertyOptional({
    description: 'Description in Arabic',
    example: 'وصف فترة الإدارة',
    nullable: true,
  })
  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string | null;

  @ApiProperty({
    description: 'User ID who created the term',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'User ID who updated the term',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
