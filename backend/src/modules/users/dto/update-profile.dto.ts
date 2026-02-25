import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsIn,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Main St',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Birth date',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'City ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Province ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  provinceId?: number;

  @ApiPropertyOptional({
    description: 'User gender',
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'User work/profession',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  userWork?: string;

  @ApiPropertyOptional({
    description: 'Languages (array or JSON string)',
    example: ['en', 'ar'],
  })
  @IsOptional()
  languages?: string[] | string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 33.8938,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.5018,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Software developer',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'Beirut, Lebanon',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Whether profile is public',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isPublicProfile?: number;

  @ApiPropertyOptional({
    description: 'FCM token for push notifications',
    example: 'fcm_token_123...',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiPropertyOptional({
    description: 'VoIP token for iOS push notifications',
    example: 'voip_token_123...',
  })
  @IsOptional()
  @IsString()
  voipToken?: string;

  @ApiPropertyOptional({
    description: 'Platform (ios, ios_voip, android, android_fcm)',
    example: 'ios',
    enum: ['ios', 'ios_voip', 'android', 'android_fcm'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ios', 'ios_voip', 'android', 'android_fcm'])
  platform?: string;

  @ApiPropertyOptional({
    description: 'Delete cover image (set to "delete" or empty string)',
    example: '',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Delete cover video (set to "delete" or empty string)',
    example: '',
  })
  @IsOptional()
  @IsString()
  coverVideo?: string;

  @ApiPropertyOptional({
    description: 'Delete main image (set to "delete" or empty string)',
    example: '',
  })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({
    description: 'Delete image (alternative field name, set to "delete" or empty string)',
    example: '',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
