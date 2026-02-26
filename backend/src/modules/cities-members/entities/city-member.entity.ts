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
 * CityMember Entity matching Yii CitiesMembers model structure
 * Table: cities_members
 */
@Entity('cities_members')
@Index(['cityId'])
@Index(['positionId'])
export class CityMemberEntity {
  @ApiProperty({
    description: 'City Member ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'City ID',
    example: '1',
    maxLength: 20,
  })
  @Column({ name: 'city_id', type: 'varchar', length: 20 })
  cityId: string;

  @ApiProperty({
    description: 'Member name',
    example: 'John Doe',
    maxLength: 200,
  })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiPropertyOptional({
    description: 'Member name in Arabic',
    example: 'جون دو',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'name_ar', type: 'varchar', length: 200, nullable: true })
  nameAr: string | null;

  @ApiPropertyOptional({
    description: 'Role',
    example: 'Mayor',
    maxLength: 100,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string | null;

  @ApiPropertyOptional({
    description: 'Position ID (foreign key to city_members_positions)',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'position_id', type: 'varchar', length: 20, nullable: true })
  positionId: string | null;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'department_id', type: 'varchar', length: 20, nullable: true })
  departmentId: string | null;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'john.doe@city.gov.lb',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+9611234567',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'phone_number', type: 'varchar', length: 100, nullable: true })
  phoneNumber: string | null;

  @ApiPropertyOptional({
    description: 'Biography',
    example: 'Experienced public servant...',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  biography: string | null;

  @ApiPropertyOptional({
    description: 'Main image',
    example: 'http://localhost/uploads/members/main.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiProperty({
    description: 'From year',
    example: '2023',
  })
  @Column({ name: 'from_year', type: 'varchar', length: 10 })
  fromYear: string;

  @ApiPropertyOptional({
    description: 'To year',
    example: '2027',
    nullable: true,
  })
  @Column({ name: 'to_year', type: 'varchar', length: 10, nullable: true })
  toYear: string | null;

  @ApiProperty({
    description: 'Is active',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @ApiPropertyOptional({
    description: 'Order number for sorting',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber: number | null;

  @ApiPropertyOptional({
    description: 'Administration term ID',
    example: 'term_abc123def456ghi7890',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'administration_term_id', type: 'varchar', length: 20, nullable: true })
  administrationTermId: string | null;

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
    example: 1,
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
    description: 'Attachment counter',
    example: 3,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number | null;
}
