import {
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Matches,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  id?: string;

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
  @Matches(/^\+\d{1,3}$/, { message: 'Country code must start with + followed by 1-3 digits' })
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Whether user is activated',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  isActivated?: number;

  @ApiPropertyOptional({
    description: 'City IDs array',
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  cityId?: number[];
}
