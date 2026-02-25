import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgBoardSettings Entity matching Yii AgBoardSettings model structure
 * Table: ag_board_settings
 */
@Entity('ag_board_settings')
@Index(['tableId', 'rowId'])
export class AgBoardSettingsEntity {
  @ApiProperty({
    description: 'Board settings ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Table ID',
    example: 210,
  })
  @Column({ name: 'table_id', type: 'int' })
  tableId: number;

  @ApiProperty({
    description: 'Row ID',
    example: 12345,
  })
  @Column({ name: 'row_id', type: 'int' })
  rowId: number;

  @ApiPropertyOptional({
    description: 'Board list field',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'board_list_field', type: 'int', nullable: true })
  boardListField: number | null;

  @ApiPropertyOptional({
    description: 'Priority field',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'priority_field', type: 'int', nullable: true })
  priorityField: number | null;

  @ApiPropertyOptional({
    description: 'Assignee field',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'assignee_field', type: 'varchar', length: 20, nullable: true })
  assigneeField: string | null;
}
