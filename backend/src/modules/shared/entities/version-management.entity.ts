import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Version Management Entity matching Yii VersionManagement model structure
 * Table: version_management
 */
@Entity('version_management')
@Index(['orderNumber'])
export class VersionManagementEntity {
  @ApiProperty({
    description: 'Version Management ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
    maxLength: 20,
  })
  @Column({ name: 'api_version', type: 'varchar', length: 20 })
  apiVersion: string;

  @ApiProperty({
    description: 'Play Store version',
    example: '1.0.0',
    maxLength: 20,
  })
  @Column({ name: 'play_store_version', type: 'varchar', length: 20 })
  playStoreVersion: string;

  @ApiProperty({
    description: 'App Store version',
    example: '1.0.0',
    maxLength: 20,
  })
  @Column({ name: 'app_store_version', type: 'varchar', length: 20 })
  appStoreVersion: string;

  @ApiProperty({
    description: 'Play Store uploaded (1 = uploaded, 0 = not uploaded)',
    example: 1,
    default: 0,
  })
  @Column({ name: 'play_store_uploaded', type: 'tinyint', default: 0 })
  playStoreUploaded: number;

  @ApiProperty({
    description: 'App Store uploaded (1 = uploaded, 0 = not uploaded)',
    example: 1,
    default: 0,
  })
  @Column({ name: 'app_store_uploaded', type: 'tinyint', default: 0 })
  appStoreUploaded: number;

  @ApiProperty({
    description: 'Is required update (1 = required, 0 = optional)',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_required', type: 'tinyint', default: 0 })
  isRequired: number;

  @ApiProperty({
    description: 'Order number for sorting',
    example: 1,
  })
  @Column({ name: 'order_number', type: 'int' })
  orderNumber: number;

  @ApiProperty({
    description: 'What\'s new description',
    example: 'Bug fixes and performance improvements',
  })
  @Column({ name: 'whats_new', type: 'text' })
  whatsNew: string;
}
