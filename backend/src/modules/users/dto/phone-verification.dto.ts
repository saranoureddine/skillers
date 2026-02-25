import { IsNotEmpty, IsOptional, IsString, Matches, IsEmail, IsNumber, IsIn, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SendPhoneVerificationDto {
  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{1,3}$/, { message: 'Country code must start with + followed by 1-3 digits' })
  countryCode: string;
}

export class VerifyPhoneCodeDto {
  @ApiProperty({
    description: 'Verification code (6 digits)',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  verificationCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{1,3}$/, { message: 'Country code must start with + followed by 1-3 digits' })
  countryCode: string;
}

export class RegisterVerifiedDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Verification token from phone verification',
    example: 'verification_token_123...',
  })
  @IsNotEmpty()
  @IsString()
  verificationToken: string;

  @ApiPropertyOptional({
    description: 'FCM token for push notifications',
    example: 'fcm_token_123...',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiPropertyOptional({
    description: 'User gender',
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Birth date',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Main St',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Software developer',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'Beirut, Lebanon',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'User work/profession',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  userWork?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Whether profile is public',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isPublicProfile?: number;

  @ApiPropertyOptional({
    description: 'Languages (array or JSON string)',
    example: ['en', 'ar'],
  })
  @IsOptional()
  languages?: string[] | string;

  @ApiPropertyOptional({
    description: 'Platform (ios, ios_voip, android, android_fcm)',
    example: 'ios',
    enum: ['ios', 'ios_voip', 'android', 'android_fcm'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ios', 'ios_voip', 'android', 'android_fcm'])
  platform?: string;
}
