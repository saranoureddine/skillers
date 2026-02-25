import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgGridsLabels Entity matching Yii AgGridsLabels model structure
 * Table: ag_grids_labels
 */
@Entity('ag_grids_labels')
@Index(['tableId', 'fieldName'])
export class AgGridsLabelsEntity {
  @ApiProperty({
    description: 'Label ID',
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
    description: 'Field name',
    example: 'first_name',
    maxLength: 50,
  })
  @Column({ name: 'field_name', type: 'varchar', length: 50 })
  fieldName: string;

  @ApiProperty({
    description: 'Field label',
    example: 'First Name',
    maxLength: 100,
  })
  @Column({ name: 'field_label', type: 'varchar', length: 100 })
  fieldLabel: string;

  @ApiPropertyOptional({
    description: 'Search field alias',
    example: 'fname',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'search_field_alias', type: 'varchar', length: 100, nullable: true })
  searchFieldAlias: string | null;

  @ApiPropertyOptional({
    description: 'Language ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'lang_id', type: 'int', nullable: true })
  langId: number | null;
}
