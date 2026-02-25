import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgDataSource Entity matching Yii AgDataSource model structure
 * Table: ag_data_source
 */
@Entity('ag_data_source')
export class AgDataSourceEntity {
  @ApiProperty({
    description: 'Data source ID',
    example: 1,
  })
  @PrimaryColumn({ type: 'int' })
  id: number;

  @ApiPropertyOptional({
    description: 'Table ID',
    example: 210,
    nullable: true,
  })
  @Column({ name: 'table_id', type: 'int', nullable: true })
  tableId: number | null;

  @ApiPropertyOptional({
    description: 'Data source',
    example: 'mysql',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'data_source', type: 'varchar', length: 255, nullable: true })
  dataSource: string | null;

  @ApiPropertyOptional({
    description: 'Related user group ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'r_user_grp_id', type: 'int', nullable: true })
  rUserGrpId: number | null;
}
