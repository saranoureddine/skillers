import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * AgDashboardPlugins Entity matching Yii AgDashboardPlugins model structure
 * Table: ag_dashboard_plugins
 */
@Entity('ag_dashboard_plugins')
export class AgDashboardPluginsEntity {
  @ApiProperty({
    description: 'Plugin ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Plugin type',
    example: 1,
  })
  @Column({ type: 'int' })
  type: number;

  @ApiProperty({
    description: 'Plugin name',
    example: 'Users Chart',
    maxLength: 200,
  })
  @Column({ name: 'plugin_name', type: 'varchar', length: 200 })
  pluginName: string;
}
