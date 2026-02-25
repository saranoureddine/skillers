import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgDashboardData Entity matching Yii AgDashboardData model structure
 * Table: ag_dashboard_data
 */
@Entity('ag_dashboard_data')
@Index(['rDashboardId', 'rowNumber'])
export class AgDashboardDataEntity {
  @ApiProperty({
    description: 'Dashboard data ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Related dashboard ID',
    example: 1,
  })
  @Column({ name: 'r_dashboard_id', type: 'int' })
  rDashboardId: number;

  @ApiProperty({
    description: 'Row number',
    example: 1,
  })
  @Column({ name: 'row_number', type: 'int' })
  rowNumber: number;

  @ApiProperty({
    description: 'Related plugin ID',
    example: 1,
  })
  @Column({ name: 'r_plugin_id', type: 'int' })
  rPluginId: number;

  @ApiProperty({
    description: 'Number of columns',
    example: 3,
  })
  @Column({ name: 'columns_no', type: 'int' })
  columnsNo: number;

  @ApiProperty({
    description: 'Label',
    example: 'Users Count',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  label: string;

  @ApiProperty({
    description: 'Text alignment',
    example: 'left',
    maxLength: 100,
  })
  @Column({ name: 'text_algin', type: 'varchar', length: 100 })
  textAlgin: string;

  @ApiPropertyOptional({
    description: 'URL',
    example: '/api/users',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  url: string | null;

  @ApiProperty({
    description: 'Query',
    example: 'SELECT COUNT(*) FROM users',
  })
  @Column({ type: 'text' })
  query: string;

  @ApiPropertyOptional({
    description: 'Text',
    example: 'Total Users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  text: string | null;

  @ApiPropertyOptional({
    description: 'Colors',
    example: '#FF5733,#33FF57',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  colors: string | null;

  @ApiPropertyOptional({
    description: 'Navigation icon',
    example: 'fa-users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'nav_icon', type: 'varchar', length: 100, nullable: true })
  navIcon: string | null;

  @ApiPropertyOptional({
    description: 'Field',
    example: 'count',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  field: string | null;

  @ApiPropertyOptional({
    description: 'Image path',
    example: '/uploads/dashboard/chart.png',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  image: string | null;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'created_at DESC',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  sort: string | null;

  @ApiPropertyOptional({
    description: 'Group by clause',
    example: 'status',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'group_by', type: 'varchar', length: 200, nullable: true })
  groupBy: string | null;

  @ApiPropertyOptional({
    description: 'Where condition (note: typo in Yii model - where_conditon)',
    example: 'status = active',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'where_conditon', type: 'varchar', length: 200, nullable: true })
  whereConditon: string | null;
}
