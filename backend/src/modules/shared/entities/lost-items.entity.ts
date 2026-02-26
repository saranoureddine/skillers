import { Column, Entity, Index, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Lost Items Entity
 * Table: lost_items
 */
@Entity('lost_items')
@Index(['status'])
@Index(['cityId'])
@Index(['userId'])
export class LostItemsEntity {
  @ApiProperty({
    description: 'Lost Item ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'User ID who reported the lost item',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'Title of the lost item',
    example: 'Lost Wallet',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50 })
  title: string;

  @ApiProperty({
    description: 'Description',
    example: 'Black leather wallet with credit cards',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  category: string;

  @ApiProperty({
    description: 'Lost date',
    example: '2024-01-01',
  })
  @Column({ name: 'lost_date', type: 'date' })
  lostDate: Date;

  @ApiProperty({
    description: 'Lost location',
    example: 'Downtown Beirut',
    maxLength: 255,
  })
  @Column({ name: 'lost_location', type: 'varchar', length: 255 })
  lostLocation: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'John Doe',
    maxLength: 255,
  })
  @Column({ name: 'contact_name', type: 'varchar', length: 255 })
  contactName: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+9611234567',
    maxLength: 255,
  })
  @Column({ name: 'contact_phone_number', type: 'varchar', length: 255 })
  contactPhoneNumber: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'john@example.com',
    maxLength: 255,
  })
  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @ApiProperty({
    description: 'Contact method',
    example: 'phone',
    maxLength: 255,
  })
  @Column({ name: 'contact_method', type: 'varchar', length: 255 })
  contactMethod: string;

  @ApiProperty({
    description: 'Is anonymous (1 = yes, 0 = no)',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_anonymous', type: 'tinyint', default: 0 })
  isAnonymous: number;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Police Station',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'storage_location', type: 'varchar', length: 255, nullable: true })
  storageLocation: string | null;

  @ApiPropertyOptional({
    description: 'Identifying features',
    example: 'Black leather, contains ID card',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'identifying_features', type: 'varchar', length: 255, nullable: true })
  identifyingFeatures: string | null;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiProperty({
    description: 'Status (pending, accepted, rejected, archived)',
    example: 'accepted',
    maxLength: 50,
    default: 'pending',
  })
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @ApiPropertyOptional({
    description: 'Archive note (only when status is archived)',
    example: 'Item found and returned',
    maxLength: 500,
    nullable: true,
  })
  @Column({ name: 'archive_note', type: 'varchar', length: 500, nullable: true })
  archiveNote: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
