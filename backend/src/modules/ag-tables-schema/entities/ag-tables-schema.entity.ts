import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgTablesSchema Entity matching Yii AgTablesSchema model structure
 * Table: ag_tables_schema
 */
@Entity('ag_tables_schema')
export class AgTablesSchemaEntity {
  @ApiProperty({
    description: 'Table schema ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Table name',
    example: 'users',
    maxLength: 50,
  })
  @Column({ name: 'table_name', type: 'varchar', length: 50 })
  tableName: string;

  @ApiPropertyOptional({
    description: 'Data source',
    example: 'default',
    nullable: true,
  })
  @Column({ name: 'data_source', type: 'text', nullable: true })
  dataSource: string | null;

  @ApiPropertyOptional({
    description: 'User ID who locked the table',
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
