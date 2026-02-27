import { Column, Entity, PrimaryColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgUser Entity matching Yii AgUsers model structure
 * Table: ag_users (Admin/Dashboard Users)
 */
@Entity('ag_users')
@Index(['userRole']) // Maps to user_role column
@Index(['active']) // Maps to active column
@Index(['createdAt']) // Maps to created_at column
export class AgUserEntity {
  @ApiProperty({
    description: 'User ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ name: 'user_id', length: 20 })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'admin_user',
    maxLength: 100,
  })
  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'first_name', type: 'varchar', length: 200, nullable: true })
  firstName: string | null;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'last_name', type: 'varchar', length: 200, nullable: true })
  lastName: string | null;

  @ApiProperty({
    description: 'Password hash (not returned in responses)',
    writeOnly: true,
    maxLength: 250,
  })
  @Column({ name: 'user_password', type: 'varchar', length: 250, select: false })
  userPassword: string;

  @ApiProperty({
    description: 'User role ID',
    example: 1,
  })
  @Column({ name: 'user_role', type: 'int' })
  userRole: number;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'admin@example.com',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'email_address', type: 'varchar', length: 255, nullable: true })
  emailAddress: string | null;

  @ApiPropertyOptional({
    description: 'Address',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  address: string | null;

  @ApiPropertyOptional({
    description: 'Phone number one',
    example: '1234567',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'phone_number_one', type: 'varchar', length: 20, nullable: true })
  phoneNumberOne: string | null;

  @ApiPropertyOptional({
    description: 'Phone number two',
    example: '7654321',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'phone_number_two', type: 'varchar', length: 20, nullable: true })
  phoneNumberTwo: string | null;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-01',
    nullable: true,
  })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @ApiPropertyOptional({
    description: 'Active status',
    example: '1',
    maxLength: 20,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true, default: '1' })
  active: string | null;

  @ApiPropertyOptional({
    description: 'Birth place',
    example: 'Beirut',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'birth_place', type: 'varchar', length: 255, nullable: true })
  birthPlace: string | null;

  @ApiPropertyOptional({
    description: 'Authentication token',
    example: 'abc123def456...',
    maxLength: 500,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  token: string | null;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    nullable: true,
  })
  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @ApiPropertyOptional({
    description: 'Main image URL',
    example: 'https://example.com/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'Last URL',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'last_url', type: 'varchar', length: 255, nullable: true })
  lastUrl: string | null;

  @ApiPropertyOptional({
    description: 'Link',
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  link: string | null;

  @ApiPropertyOptional({
    description: 'Description',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Locked by user ID',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiPropertyOptional({
    description: 'Created by user ID',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20, nullable: true })
  createdBy: string | null;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'updated_by', type: 'varchar', length: 20, nullable: true })
  updatedBy: string | null;

  @ApiPropertyOptional({
    description: 'Center number',
    example: 10,
    nullable: true,
  })
  @Column({ name: 'center_num', type: 'int', nullable: true })
  centerNum: number | null;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true, default: 0 })
  attachmentCounter: number | null;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ApiProperty({
    description: 'User related to city',
    example: 0,
    default: 0,
  })
  @Column({ name: 'user_related_to_city', type: 'int', default: 0 })
  userRelatedToCity: number;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number | null;

  @ApiPropertyOptional({
    description: 'Store ID',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'store_id', type: 'varchar', length: 20, nullable: true })
  storeId: string | null;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
    default: 0.0,
  })
  @Column({ name: 'average_rating', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  averageRating: number;

  @ApiProperty({
    description: 'Total ratings count',
    example: 10,
    default: 0,
  })
  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @ApiPropertyOptional({
    description: 'Reset code for password reset',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'reset_code', type: 'varchar', length: 20, nullable: true })
  resetCode: string | null;

  @ApiPropertyOptional({
    description: 'Reset code date',
    nullable: true,
  })
  @Column({ name: 'reset_code_date', type: 'datetime', nullable: true })
  resetCodeDate: Date | null;
}
