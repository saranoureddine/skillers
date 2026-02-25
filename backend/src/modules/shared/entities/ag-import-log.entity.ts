import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgImportLog Entity matching Yii AgImportLog model structure
 * Table: ag_import_log
 */
@Entity('ag_import_log')
export class AgImportLogEntity {
  @ApiProperty({
    description: 'Import log ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Number of successful rows imported',
    example: 100,
  })
  @Column({ name: 'success_rows', type: 'int' })
  successRows: number;

  @ApiProperty({
    description: 'Number of empty rows',
    example: 5,
  })
  @Column({ name: 'empty_rows', type: 'int' })
  emptyRows: number;

  @ApiProperty({
    description: 'Total number of rows',
    example: 105,
  })
  @Column({ name: 'all_rows', type: 'int' })
  allRows: number;

  @ApiProperty({
    description: 'Destination table name',
    example: 'users',
    maxLength: 255,
  })
  @Column({ name: 'dest_table', type: 'varchar', length: 255 })
  destTable: string;

  @ApiPropertyOptional({
    description: 'Import timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;
}
