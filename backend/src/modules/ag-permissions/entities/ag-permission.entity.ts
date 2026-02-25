import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgPermission Entity matching Yii AgPermissions model structure
 * Table: ag_permissions
 */
@Entity('ag_permissions')
@Index(['tableId'])
@Index(['groupId'])
@Index(['userId'])
export class AgPermissionEntity {
  @ApiProperty({
    description: 'Permission ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'Table ID (foreign key to ag_tables_schema)',
    example: 1,
  })
  @Column({ name: 'table_id', type: 'int' })
  tableId: number;

  @ApiPropertyOptional({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20, nullable: true })
  userId: string | null;

  @ApiPropertyOptional({
    description: 'Group ID (foreign key to ag_user_groups)',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId: number | null;

  @ApiProperty({
    description: 'Can create permission',
    example: 1,
    enum: [0, 1],
    default: 0,
  })
  @Column({ type: 'tinyint', default: 0 })
  create: number;

  @ApiProperty({
    description: 'Can view permission',
    example: 1,
    enum: [0, 1],
    default: 0,
  })
  @Column({ type: 'tinyint', default: 0 })
  view: number;

  @ApiProperty({
    description: 'Can update permission',
    example: 1,
    enum: [0, 1],
    default: 0,
  })
  @Column({ type: 'tinyint', default: 0 })
  update: number;

  @ApiProperty({
    description: 'Can delete permission',
    example: 0,
    enum: [0, 1],
    default: 0,
  })
  @Column({ type: 'tinyint', default: 0 })
  delete: number;

  @ApiPropertyOptional({
    description: 'Permission condition',
    example: 'status = active',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  condition: string | null;

  @ApiProperty({
    description: 'User ID who created the permission',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'User ID who updated the permission',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

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
    description: 'Center number',
    example: 0,
    default: 0,
  })
  @Column({ name: 'center_num', type: 'int', default: 0, nullable: true })
  centerNum: number | null;
}
