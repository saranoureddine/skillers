import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgFilters Entity matching Yii AgFilters model structure
 * Table: ag_filters
 */
@Entity('ag_filters')
@Index(['agGridId'])
export class AgFiltersEntity {
  @ApiProperty({
    description: 'Filter ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Ag Grid ID',
    example: 1,
  })
  @Column({ name: 'ag_grid_id', type: 'int' })
  agGridId: number;

  @ApiPropertyOptional({
    description: 'Filter name',
    example: 'Active Users Filter',
    maxLength: 500,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  name: string | null;

  @ApiPropertyOptional({
    description: 'Filter configuration (JSON string)',
    example: '{"status": "active", "role": "admin"}',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  filters: string | null;
}
