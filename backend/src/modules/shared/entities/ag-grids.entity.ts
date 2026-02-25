import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgGrids Entity matching Yii AgGrids model structure
 * Table: ag_grids
 */
@Entity('ag_grids')
@Index(['tableId', 'userId'])
export class AgGridsEntity {
  @ApiProperty({
    description: 'Grid ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Grid ID (reference)',
    example: 1,
  })
  @Column({ name: 'grid_id', type: 'int' })
  gridId: number;

  @ApiProperty({
    description: 'Table ID',
    example: '210',
    maxLength: 100,
  })
  @Column({ name: 'table_id', type: 'varchar', length: 100 })
  tableId: string;

  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ApiProperty({
    description: 'Sorting configuration',
    example: 'id DESC, name ASC',
  })
  @Column({ type: 'text' })
  sorting: string;

  @ApiProperty({
    description: 'Shown columns (comma-separated)',
    example: 'id,name,email,status',
  })
  @Column({ name: 'shown_columns', type: 'text' })
  shownColumns: string;

  @ApiProperty({
    description: 'Field sizes (comma-separated)',
    example: '150px,200px,250px',
  })
  @Column({ name: 'field_size', type: 'text' })
  fieldSize: string;

  @ApiProperty({
    description: 'Rows per page',
    example: 10,
  })
  @Column({ name: 'rows_per_page', type: 'int' })
  rowsPerPage: number;

  @ApiPropertyOptional({
    description: 'Filter configuration',
    example: 'status::=::activeANDFILTERrole::=::admin',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  filters: string | null;

  @ApiPropertyOptional({
    description: 'Font size',
    example: '14px',
    maxLength: 11,
    nullable: true,
  })
  @Column({ name: 'font_size', type: 'varchar', length: 11, nullable: true })
  fontSize: string | null;

  @ApiPropertyOptional({
    description: 'Status',
    example: 1,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  status: number | null;

  @ApiPropertyOptional({
    description: 'Selected filters',
    example: 'filter1,filter2',
    nullable: true,
  })
  @Column({ name: 'selected_filters', type: 'text', nullable: true })
  selectedFilters: string | null;

  @ApiPropertyOptional({
    description: 'Export query (SQL)',
    example: 'SELECT * FROM users WHERE status = "active"',
    nullable: true,
  })
  @Column({ name: 'export_query', type: 'text', nullable: true })
  exportQuery: string | null;
}
