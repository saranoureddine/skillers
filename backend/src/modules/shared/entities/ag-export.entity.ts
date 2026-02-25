import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgExport Entity matching Yii AgExport model structure
 * Table: ag_export
 */
@Entity('ag_export')
export class AgExportEntity {
  @ApiProperty({
    description: 'Export ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Center number ID',
    example: 10,
  })
  @Column({ name: 'center_num_id', type: 'int' })
  centerNumId: number;

  @ApiProperty({
    description: 'Table name',
    example: 'users',
    maxLength: 255,
  })
  @Column({ name: 'table_name', type: 'varchar', length: 255 })
  tableName: string;

  @ApiProperty({
    description: 'Include data flag',
    example: 1,
  })
  @Column({ name: 'with_data', type: 'tinyint' })
  withData: number;

  @ApiProperty({
    description: 'Include attachments flag',
    example: 1,
  })
  @Column({ name: 'with_attachments', type: 'tinyint' })
  withAttachments: number;

  @ApiProperty({
    description: 'Include contents flag',
    example: 1,
  })
  @Column({ name: 'with_contents', type: 'tinyint' })
  withContents: number;

  @ApiProperty({
    description: 'Include source flag',
    example: 1,
  })
  @Column({ name: 'with_source', type: 'tinyint' })
  withSource: number;

  @ApiPropertyOptional({
    description: 'Excluded columns (note: typo in Yii model - execluded_columns)',
    example: 'password,reset_code',
    nullable: true,
  })
  @Column({ name: 'execluded_columns', type: 'text', nullable: true })
  execludedColumns: string | null;

  @ApiPropertyOptional({
    description: 'Where condition',
    example: 'status = active',
    nullable: true,
  })
  @Column({ name: 'where_cond', type: 'text', nullable: true })
  whereCond: string | null;

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

  @ApiProperty({
    description: 'Center number',
    example: 10,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;
}
