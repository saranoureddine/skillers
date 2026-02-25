import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User Entity matching Yii Users model structure
 * Table: users
 */
@Entity('users')
export class UserEntity {
  @ApiProperty({
    description: 'User ID (20 character string)',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @PrimaryColumn({ length: 20 })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    maxLength: 50,
  })
  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    maxLength: 100,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @Column({ name: 'country_code', type: 'varchar', length: 100 })
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @Column({ name: 'phone_number', type: 'varchar', length: 50 })
  phoneNumber: string;

  @ApiProperty({
    description: 'Password hash (not returned in responses)',
    writeOnly: true,
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @ApiProperty({
    description: 'Whether user is activated',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_activated', type: 'tinyint', default: 1 })
  isActivated: number;

  @ApiProperty({
    description: 'Whether user is a guest',
    example: 0,
    default: 0,
  })
  @Column({ name: 'is_guest', type: 'tinyint', default: 0 })
  isGuest: number;

  @ApiProperty({
    description: 'Authentication token',
    example: 'abc123def456...',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  token: string;

  @ApiPropertyOptional({
    description: 'Main profile image URL',
    example: 'https://example.com/image.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_image', type: 'varchar', length: 255, nullable: true })
  mainImage: string | null;

  @ApiPropertyOptional({
    description: 'User gender',
    example: 'male',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string | null;

  @ApiPropertyOptional({
    description: 'Birth date',
    example: '1990-01-01',
    nullable: true,
  })
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Main St',
    maxLength: 200,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string | null;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'city_id', type: 'int', nullable: true })
  cityId: number;

  @ApiPropertyOptional({
    description: 'Province ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'province_id', type: 'int', nullable: true })
  provinceId: number;

  @ApiPropertyOptional({
    description: 'Attachment counter',
    example: 0,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'int', nullable: true })
  attachmentCounter: number;

  @ApiPropertyOptional({
    description: 'Locked by user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'locked_by', type: 'varchar', length: 20, nullable: true })
  lockedBy: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @Column({ name: 'created_by', type: 'varchar', length: 20 })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Updated by user ID',
    example: '507f1f77bcf86cd799439012',
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

  @ApiPropertyOptional({
    description: 'Password reset code',
    example: '123456',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'reset_code', type: 'varchar', length: 10, nullable: true })
  resetCode: string | null;

  @ApiPropertyOptional({
    description: 'Reset code date',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'reset_code_date', type: 'datetime', nullable: true })
  resetCodeDate: Date | null;

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
    description: 'User work/profession',
    example: 'Software Engineer',
    nullable: true,
  })
  @Column({ name: 'user_work', type: 'text', nullable: true })
  userWork: string | null;

  @ApiPropertyOptional({
    description: 'Languages (JSON array)',
    example: '["en", "ar"]',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  languages: string | null;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 33.8938,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.5018,
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty({
    description: 'Followers count',
    example: 100,
    default: 0,
  })
  @Column({ name: 'followers_count', type: 'int', default: 0 })
  followersCount: number;

  @ApiProperty({
    description: 'Following count',
    example: 50,
    default: 0,
  })
  @Column({ name: 'following_count', type: 'int', default: 0 })
  followingCount: number;

  @ApiPropertyOptional({
    description: 'Last seen timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'last_seen', type: 'datetime', nullable: true })
  lastSeen: Date | null;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Software developer passionate about coding',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://example.com',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  website: string | null;

  @ApiProperty({
    description: 'Whether profile is public',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_public_profile', type: 'tinyint', default: 1 })
  isPublicProfile: number;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'Beirut, Lebanon',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  location: string | null;

  @ApiPropertyOptional({
    description: 'FCM token for push notifications',
    example: 'fcm_token_123...',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'fcmToken', type: 'varchar', length: 255, nullable: true })
  fcmToken: string | null;

  @ApiPropertyOptional({
    description: 'VoIP token for iOS push notifications',
    example: 'voip_token_123...',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'voipToken', type: 'varchar', length: 255, nullable: true })
  voipToken: string | null;

  @ApiPropertyOptional({
    description: 'Platform (ios_voip or android_fcm)',
    example: 'ios_voip',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  platform: string | null;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://example.com/cover.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'cover_image', type: 'varchar', length: 255, nullable: true })
  coverImage: string | null;

  @ApiPropertyOptional({
    description: 'Whether user is online',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'is_online', type: 'tinyint', nullable: true })
  isOnline: number;

  @ApiPropertyOptional({
    description: 'Whether user is a specialist',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'is_specialist', type: 'tinyint', nullable: true })
  isSpecialist: number;

  @ApiPropertyOptional({
    description: 'Whether specialist is verified',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'specialist_verified', type: 'tinyint', nullable: true })
  specialistVerified: number;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
    nullable: true,
  })
  @Column({ name: 'years_experience', type: 'int', nullable: true })
  yearsExperience: number;

  @ApiPropertyOptional({
    description: 'Hourly rate',
    example: 50.0,
    nullable: true,
  })
  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @ApiPropertyOptional({
    description: 'Specialist category',
    example: 'IT',
    nullable: true,
  })
  @Column({ name: 'specialist_category', type: 'text', nullable: true })
  specialistCategory: string | null;

  @ApiPropertyOptional({
    description: 'Whether user is top specialist',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'is_top', type: 'tinyint', nullable: true })
  isTop: number;

  @ApiPropertyOptional({
    description: 'Receive notifications preference',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'receive_notifications', type: 'tinyint', nullable: true })
  receiveNotifications: number;

  @ApiPropertyOptional({
    description: 'Receive calls preference',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'receive_calls', type: 'tinyint', nullable: true })
  receiveCalls: number;

  @ApiPropertyOptional({
    description: 'Receive offers preference',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'receive_offers', type: 'tinyint', nullable: true })
  receiveOffers: number;

  @ApiPropertyOptional({
    description: 'Receive updates preference',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'receive_updates', type: 'tinyint', nullable: true })
  receiveUpdates: number;

  @ApiPropertyOptional({
    description: 'Registration method',
    example: 'phone_number',
    nullable: true,
  })
  @Column({ name: 'registration_method', type: 'varchar', length: 50, nullable: true })
  registrationMethod: string | null;

  @ApiPropertyOptional({
    description: 'CV URL',
    example: 'https://example.com/cv.pdf',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  cv: string | null;
}
