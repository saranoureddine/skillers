import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgImportSynonyms Entity matching Yii AgImportSynonyms model structure
 * Table: ag_import_synonyms
 */
@Entity('ag_import_synonyms')
export class AgImportSynonymsEntity {
  @ApiProperty({
    description: 'Synonym ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiPropertyOptional({
    description: 'Name 1',
    example: 'John Doe',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'name_1', type: 'varchar', length: 255, nullable: true })
  name1: string | null;

  @ApiPropertyOptional({
    description: 'Name 2 (synonym)',
    example: 'J. Doe',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'name_2', type: 'varchar', length: 255, nullable: true })
  name2: string | null;

  @ApiPropertyOptional({
    description: 'User ID who locked the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'int', nullable: true })
  lockedBy: number | null;

  @ApiProperty({
    description: 'User ID who created the record',
    example: 1,
  })
  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @ApiPropertyOptional({
    description: 'User ID who updated the record',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @ApiProperty({
    description: 'Center number',
    example: 10,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

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
