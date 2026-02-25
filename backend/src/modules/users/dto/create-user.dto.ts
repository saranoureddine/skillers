import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  MinLength,
  Matches,
  IsNumber,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
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
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{1,3}$/, { message: 'Country code must start with + followed by 1-3 digits' })
  countryCode: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  userPassword: string;

  @ApiProperty({
    description: 'City IDs array',
    example: [1, 2],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  cityId: number[];

  @ApiPropertyOptional({
    description: 'Province ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  provinceId?: number;

  @ApiPropertyOptional({
    description: 'Created by user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Whether user is activated',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isActivated?: number;
}
