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
 * AgBoardLists Entity matching Yii AgBoardLists model structure
 * Table: ag_board_lists
 */
@Entity('ag_board_lists')
@Index(['tableId', 'rowId'])
export class AgBoardListsEntity {
  @ApiProperty({
    description: 'Board list ID',
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
    description: 'List name',
    example: 'To Do',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @ApiPropertyOptional({
    description: 'Color',
    example: '#FF5733',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  color: string | null;

  @ApiPropertyOptional({
    description: 'Assignee user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  assignee: string | null;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Task description',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Order number',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber: number | null;

  @ApiPropertyOptional({
    description: 'User ID who locked the record',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiProperty({
    description: 'User ID who created the record',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'User ID who updated the record',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

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
    example: '/uploads/boards/image.jpg',
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
