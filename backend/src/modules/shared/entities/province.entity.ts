import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Province Entity matching Yii Province model structure
 * Table: province
 */
@Entity('province')
@Index(['province'])
export class ProvinceEntity {
  @ApiProperty({
    description: 'Province ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'District name',
    example: 'Beirut',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  district: string;

  @ApiProperty({
    description: 'Province name (English)',
    example: 'Beirut',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  province: string;

  @ApiPropertyOptional({
    description: 'Province name (Arabic)',
    example: 'بيروت',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'province_ar', type: 'varchar', length: 100, nullable: true })
  provinceAr: string | null;

  @ApiProperty({
    description: 'Center number',
    example: 1,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

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
