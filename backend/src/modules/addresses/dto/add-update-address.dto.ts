import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddUpdateAddressDto {
  @ApiPropertyOptional({
    description: 'Address ID (required for update, omit for create)',
    example: 'e87b786bac5234367b4a',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  addressId?: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+961',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '1234567',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main Street',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description: 'Route name',
    example: 'Route 1',
  })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({
    description: 'Building name',
    example: 'Building A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  building?: string;

  @ApiPropertyOptional({
    description: 'Floor number',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 33.8938,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.5018,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
