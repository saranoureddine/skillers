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
 * AgCardsOrder Entity matching Yii AgCardsOrder model structure
 * Table: ag_cards_order
 */
@Entity('ag_cards_order')
@Index(['tableId', 'rowId'])
export class AgCardsOrderEntity {
  @ApiProperty({
    description: 'Card order ID',
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
}
