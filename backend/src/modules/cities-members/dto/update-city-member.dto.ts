import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCityMemberDto {
  @ApiProperty({
    description: 'City Member ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  id: string;

  @ApiPropertyOptional({
    description: 'City ID',
    example: '1',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  city_id?: string;

  @ApiPropertyOptional({
    description: 'Member name',
    example: 'John Doe',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Name in Arabic',
    example: 'جون دو',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_ar?: string;

  @ApiPropertyOptional({
    description: 'From year',
    example: '2023',
  })
  @IsOptional()
  @IsString()
  from_year?: string;

  @ApiPropertyOptional({
    description: 'To year',
    example: '2027',
  })
  @IsOptional()
  @IsString()
  to_year?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+9611234567',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'Order number for sorting',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order_number?: number;

  @ApiPropertyOptional({
    description: 'Main image URL',
    example: 'http://localhost/uploads/members/main.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  main_image?: string;

  @ApiPropertyOptional({
    description: 'Position ID',
    example: '1',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  position_id?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'john.doe@city.gov.lb',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: '1',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  department_id?: string;

  @ApiPropertyOptional({
    description: 'Is active (0 or 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  is_active?: number;

  @ApiPropertyOptional({
    description: 'Biography',
    example: 'Experienced public servant...',
  })
  @IsOptional()
  @IsString()
  biography?: string;
}
