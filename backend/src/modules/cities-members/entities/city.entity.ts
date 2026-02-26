import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * City Entity matching Yii Cities model structure
 * Table: cities
 */
@Entity('cities')
@Index(['showHide'])
export class CityEntity {
  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Beirut',
    maxLength: 36,
    nullable: true,
  })
  @Column({ name: 'city_name', type: 'varchar', length: 36, nullable: true })
  cityName: string | null;

  @ApiPropertyOptional({
    description: 'City name in Arabic',
    example: 'بيروت',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'city_name_ar', type: 'varchar', length: 255, nullable: true })
  cityNameAr: string | null;

  @ApiPropertyOptional({
    description: 'Province',
    example: 'Beirut',
    maxLength: 32,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 32, nullable: true })
  province: string | null;

  @ApiProperty({
    description: 'Location',
    example: 'Lebanon',
    maxLength: 250,
  })
  @Column({ type: 'varchar', length: 250 })
  location: string;

  @ApiPropertyOptional({
    description: 'Definition in Arabic',
    example: 'عاصمة لبنان',
    nullable: true,
  })
  @Column({ name: 'definition_ar', type: 'text', nullable: true })
  definitionAr: string | null;

  @ApiPropertyOptional({
    description: 'Address in English',
    example: '123 Main Street',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'address_en', type: 'varchar', length: 255, nullable: true })
  addressEn: string | null;

  @ApiPropertyOptional({
    description: 'Address in Arabic',
    example: 'شارع الرئيسي 123',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'address_ar', type: 'varchar', length: 255, nullable: true })
  addressAr: string | null;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.5018,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 33.8938,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://beirut.gov.lb',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  websiteUrl: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+9611234567',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'phone_number', type: 'varchar', length: 255, nullable: true })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Area',
    example: '85 km²',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  area: string;

  @ApiProperty({
    description: 'Population',
    example: '2000000',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  population: string;

  @ApiProperty({
    description: 'Elevation',
    example: '0 m',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  elevation: string;

  @ApiProperty({
    description: 'Definition',
    example: 'Capital city of Lebanon',
  })
  @Column({ type: 'text' })
  definition: string;

  @ApiProperty({
    description: 'Show/Hide flag',
    example: 1,
    default: 1,
  })
  @Column({ name: 'show_hide', type: 'int', default: 1 })
  showHide: number;

  @ApiPropertyOptional({
    description: 'Locked by user ID',
    example: 'user_locked_by_id',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: 'user_created_by_id',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: 'user_updated_by_id',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiProperty({
    description: 'Center number',
    example: 10,
  })
  @Column({ name: 'center_num', type: 'int' })
  centerNum: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2023-01-01T10:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2023-01-01T10:00:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Main image',
    example: 'http://localhost/uploads/cities/main.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 5,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number | null;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'info@beirut.gov.lb',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;
}
