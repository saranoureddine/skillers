import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgDeletedRecords Entity matching Yii AgDeletedRecords model structure
 * Table: ag_deleted_records
 */
@Entity('ag_deleted_records')
@Index(['tableId', 'rowId'])
export class AgDeletedRecordsEntity {
  @ApiProperty({
    description: 'Deleted record ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'Table ID',
    example: 210,
    nullable: true,
  })
  @Column({ name: 'table_id', type: 'int', nullable: true })
  tableId: number | null;

  @ApiPropertyOptional({
    description: 'Row ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'row_id', type: 'varchar', length: 20, nullable: true })
  rowId: string | null;

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

  @ApiPropertyOptional({
    description: 'Main image path',
    example: '/uploads/deleted/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number | null;
}
