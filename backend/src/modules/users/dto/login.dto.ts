import { IsNotEmpty, IsOptional, IsString, Matches, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
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
  @Matches(/^[0-9]{6,15}$/, { message: 'Phone number must be 6-15 digits' })
  phoneNumber: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

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
